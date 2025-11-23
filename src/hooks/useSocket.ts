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

    // New message
    socketService.onMessage((message: Message) => {
      dispatch(addMessage(message));
    });

    // Typing indicators
    socketService.onTyping((data: TypingIndicator) => {
      dispatch(setTypingIndicator(data));
    });

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
        socketService.off('typing');
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