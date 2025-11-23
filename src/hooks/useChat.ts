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
    if (!body.trim()) return;

    const tempId = `temp_${Date.now()}`;
    
    const attachmentData = attachments.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));
    
    const tempMessage: Message = {
      _id: tempId,
      tempId,
      conversation: conversationId,
      sender: currentUser?._id || 'unknown_user',
      body: body.trim(),
      attachments: attachmentData,
      readBy: [],
      deliveredTo: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(addMessage(tempMessage));

    try {
      const sentMessage = await socketService.sendMessage({
        conversationId,
        body: body.trim(),
        tempId,
        attachments: attachmentData,
      });
      if (sentMessage && sentMessage._id) {
        dispatch(updateMessage({ tempId, message: sentMessage }));
      }

      handleStopTyping(conversationId);
      
    } catch (error) {
      console.warn('Failed to send message:', error);
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