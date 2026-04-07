// src/hooks/useSocket.ts
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { socketService } from '../services/socketService';
import { 
  setConnectionStatus,
  addMessage,
  setTypingIndicator,
  markMessagesAsRead,
  markMessageDelivered,
  setUserOnline,
  setUserOffline,
} from '../feature/chat/chatSlice';
import type { Message, TypingIndicator, ReadReceipt, DeliveryAck, UserPresence } from '../types';

export const useSocket = () => {
  const dispatch = useDispatch();
  const chatState = useSelector((state: RootState) => state.chat);
  const isInitialized = useRef(false);

  const connectSocket = async (token: string) => {
    try {
      await socketService.connect(token);
      dispatch(setConnectionStatus(true));
      
      if (!isInitialized.current) {
        setupSocketListeners();
        isInitialized.current = true;
      }
    } catch (error) {
      console.warn('Failed to connect socket:', error);
      dispatch(setConnectionStatus(false));
    }
  };

  const disconnectSocket = () => {
    socketService.disconnect();
    dispatch(setConnectionStatus(false));
    isInitialized.current = false;
  };

  const setupSocketListeners = () => {
    // Connection status events
    socketService.on('connect', () => {
      dispatch(setConnectionStatus(true));
    });

    socketService.on('disconnect', () => {
      dispatch(setConnectionStatus(false));
    });

    // New message - accept multiple event names and normalize payload
    const handleIncomingMessage = (raw: any) => {
      // Normalize sender - handle both object and string formats
      let sender: any = raw.sender || raw.from || raw.user || raw.userId;
      if (sender && typeof sender === 'object') {
        sender = sender;
      } else if (sender && typeof sender === 'string') {
        sender = sender;
      }

      const message: Message = {
        ...raw,
        _id: raw._id || raw.id || raw.messageId,
        conversation: String(raw.conversation || raw.conversationId || raw.roomId),
        sender: sender,
        body: raw.body || raw.text || raw.message || '',
        attachments: raw.attachments || raw.files || [],
        readBy: Array.isArray(raw.readBy) ? raw.readBy : (raw.readers || []),
        deliveredTo: Array.isArray(raw.deliveredTo) ? raw.deliveredTo : (raw.delivered || []),
        createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
        updatedAt: raw.updatedAt || raw.updated_at || (raw.createdAt || new Date().toISOString()),
      } as Message;

      if (!message.conversation || !message._id) {
        console.warn('Invalid message received:', raw);
        return; // cannot place message without conversation or _id
      }
      
      // Always dispatch - don't filter by sender
      // The addMessage reducer will handle deduplication
      dispatch(addMessage(message));
    };

    socketService.on('message', handleIncomingMessage);
    socketService.on('new_message', handleIncomingMessage);
    socketService.on('message:new', handleIncomingMessage);

    // Typing indicators - accept multiple event names and normalize payloads
    const typingTimeouts: Record<string, number> = {};

    const handleTyping = (data: any) => {
      const normalized = {
        conversationId: data.conversationId || data.conversation || data.roomId,
        userId: data.userId || data.user || data.from,
        isTyping: typeof data.isTyping === 'boolean' ? data.isTyping : (data.typing === true),
      } as TypingIndicator;

      if (!normalized.conversationId || !normalized.userId) return;

      // Update typing state
      dispatch(setTypingIndicator(normalized));

      const key = `${normalized.conversationId}:${normalized.userId}`;
      // Clear any existing timeout
      if (typingTimeouts[key]) {
        clearTimeout(typingTimeouts[key]);
        delete typingTimeouts[key];
      }

      // If server says user stopped typing, nothing more to do
      if (!normalized.isTyping) return;

      // Otherwise, set a timeout to clear the typing indicator after 3s
      typingTimeouts[key] = window.setTimeout(() => {
        dispatch(setTypingIndicator({ conversationId: normalized.conversationId, userId: normalized.userId, isTyping: false }));
        delete typingTimeouts[key];
      }, 3000) as unknown as number;
    };

    socketService.on('typing', handleTyping);
    socketService.on('user_typing', handleTyping);
    socketService.on('typing_indicator', handleTyping);

    // Read receipts
    socketService.onRead((data: ReadReceipt) => {
      dispatch(markMessagesAsRead({
        conversationId: data.conversationId,
        messageIds: data.messageIds,
        userId: data.userId
      }));
    });

    // Message delivered
    socketService.onMessageDelivered((data: DeliveryAck) => {
      dispatch(markMessageDelivered({
        conversationId: data.conversationId,
        messageId: data.messageId,
        userId: data.userId
      }));
    });

    // User presence
    socketService.onUserOnline((data: UserPresence) => {
      dispatch(setUserOnline(data.userId));
    });

    socketService.onUserOffline((data: UserPresence) => {
      dispatch(setUserOffline(data.userId));
    });

    // Notifications
    socketService.onNotification((notification) => {
      console.warn('Received notification:', notification);
      // Handle notifications (could show toast, update badge, etc.)
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up listeners but don't disconnect (other components might be using it)
      if (isInitialized.current) {
        socketService.off('connect');
        socketService.off('disconnect');
        socketService.off('message');
        socketService.off('new_message');
        socketService.off('message:new');
        socketService.off('typing');
        socketService.off('user_typing');
        socketService.off('typing_indicator');
        socketService.off('read');
        socketService.off('message_delivered');
        socketService.off('user_online');
        socketService.off('user_offline');
        socketService.off('notification');
        isInitialized.current = false;
      }
    };
  }, []);

  return {
    connectSocket,
    disconnectSocket,
    isConnected: chatState.isConnected,
    socketService,
  };
};