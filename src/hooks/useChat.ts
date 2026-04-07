// src/hooks/useChat.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';
import { socketService } from '../services/socketService';
import { 
  fetchConversations,
  fetchMessages,
  createConversation,
  addMessage,
  updateMessage,
  setActiveConversation,
  clearTypingIndicator,
} from '../feature/chat/chatSlice';
import type { Message, Conversation } from '../types';

export const useChat = () => {
  const dispatch = useDispatch<AppDispatch>();
  const chatState = useSelector((state: RootState) => state.chat);
  const currentUser = useSelector((state: RootState) => state.users.currentUser);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);

  // Load conversations
  const loadConversations = useCallback(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const loadMessages = useCallback((conversationId: string, limit = 50, before?: string) => {
    dispatch(fetchMessages({ conversationId, limit, before }));
  }, [dispatch]);

  const handleStopTyping = useCallback((conversationId: string) => {
    if (isTyping) {
      setIsTyping(false);
      socketService.sendTypingIndicator(conversationId, false);
    }
    
    if (typingTimeoutRef.current !== null) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    dispatch(clearTypingIndicator(conversationId));
  }, [isTyping, dispatch]);

  const joinConversation = useCallback(async (conversationId: string) => {
    dispatch(setActiveConversation(conversationId));
    
    if (!chatState.messages[conversationId] || chatState.messages[conversationId].length === 0) {
      dispatch(fetchMessages({ conversationId, limit: 50 }));
    }
    
    await socketService.joinConversation(conversationId);
  }, [dispatch, chatState.messages]);

  const sendMessage = useCallback(async (conversationId: string, body: string, attachments: File[] = []) => {
    // Allow sending if there's either a message body or attachments
    if (!body.trim() && attachments.length === 0) return;

    // Generate unique tempId using timestamp + random to avoid collisions
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Convert files to base64 for sending (or prepare for upload)
    const attachmentData = await Promise.all(
      attachments.map(async (file) => {
        // For now, create a preview URL and prepare file data
        // In production, you'd upload the file first and get a URL
        const previewUrl = URL.createObjectURL(file);
        
        // Convert to base64 for sending via socket
        return new Promise<{ url: string; name: string; size: number; data?: string }>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              url: previewUrl, // Preview URL for immediate display
              name: file.name,
              size: file.size,
              data: reader.result as string, // Base64 data for sending
            });
          };
          reader.onerror = () => {
            resolve({
              url: previewUrl,
              name: file.name,
              size: file.size,
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );
    
    const resolvedAttachments = await Promise.all(attachmentData);
    
    // Create attachment objects matching the Attachment interface
    const attachmentObjects = resolvedAttachments.map(att => ({
      url: att.url,
      name: att.name,
      size: att.size,
    }));
    
    const tempMessage: Message = {
      _id: tempId,
      tempId,
      conversation: conversationId,
      sender: currentUser?._id || 'unknown_user',
      body: body.trim() || '', // Allow empty body if attachments exist
      attachments: attachmentObjects,
      readBy: [],
      deliveredTo: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add temp message optimistically
    dispatch(addMessage(tempMessage));

    try {
      // Prepare attachment data for sending (use base64 data if available, otherwise URL)
      const attachmentsForSend = resolvedAttachments.map(att => ({
        url: att.data || att.url, // Use base64 data if available, otherwise URL
        name: att.name,
        size: att.size,
      }));

      // Send message via socket
      const sentMessage = await socketService.sendMessage({
        conversationId,
        body: body.trim() || '',
        tempId,
        attachments: attachmentsForSend,
      });
      
      // Update temp message with server response
      // Note: The socket will also broadcast the message back, but we update here
      // to ensure the temp message is replaced with the real one immediately
      if (sentMessage && sentMessage._id) {
        dispatch(updateMessage({ tempId, message: sentMessage }));
      }

      handleStopTyping(conversationId);
      
    } catch (error) {
      console.warn('Failed to send message:', error);
      // Optionally, you could mark the temp message as failed here
    }
  }, [dispatch, handleStopTyping, currentUser]);

  const createNewConversation = useCallback(async (
    participantIds: string[], 
    type: 'direct' | 'group', 
    title?: string
  ) => {
    try {
      const action = await dispatch(createConversation({ participantIds, type, title }));
      if (createConversation.fulfilled.match(action)) {
        const newConversation = action.payload as Conversation;
        await joinConversation(newConversation._id);
        return newConversation;
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  }, [dispatch, joinConversation]);

  const handleStartTyping = useCallback((conversationId: string) => {
    if (!isTyping) {
      setIsTyping(true);
      socketService.sendTypingIndicator(conversationId, true);
    }

    if (typingTimeoutRef.current !== null) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      handleStopTyping(conversationId);
    }, 2000);
  }, [isTyping, handleStopTyping]);

  const markAsRead = useCallback((conversationId: string, messageIds: string[]) => {
    socketService.markMessagesAsRead(conversationId, messageIds);
  }, []);

  const getTypingUsers = useCallback((conversationId: string): string[] => {
    return chatState.typingUsers[conversationId] || [];
  }, [chatState.typingUsers]);

  const getUnreadCount = useCallback((conversation: Conversation): number => {
    return conversation.unreadCount || 0;
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current !== null) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    conversations: chatState.conversations,
    activeConversation: chatState.activeConversation,
    messages: chatState.messages,
    isConnected: chatState.isConnected,
    loading: chatState.loading,
    error: chatState.error,
    onlineUsers: chatState.onlineUsers,

    // Actions
    loadConversations,
    loadMessages,
    joinConversation,
    sendMessage,
    createNewConversation,
    handleStartTyping,
    handleStopTyping,
    markAsRead,

    // Utilities
    getTypingUsers,
    getUnreadCount,
    isTyping,
  };
};