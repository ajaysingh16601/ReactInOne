// src/services/socketService.ts
import { io, Socket } from 'socket.io-client';
import { config } from '../config/config';
import type { 
  Message, 
  SocketMessage, 
  TypingIndicator, 
  ReadReceipt, 
  DeliveryAck,
  UserPresence,
  SocketCallbackResponse
} from '../types';

export class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(config.SOCKET_URL || config.API_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 5000
      });

      this.socket.on('connect', () => {
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        this.handleConnectionError(error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        // disconnected
      });

      // Set up reconnection logic
      this.socket.on('reconnect_attempt', () => {
        this.reconnectAttempts++;
      });

      this.socket.on('reconnect_failed', () => {
        // reconnect failed
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join conversation room
  joinConversation(conversationId: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        resolve(false);
        return;
      }

      this.socket.emit('join_conversation', { conversationId }, (response: SocketCallbackResponse) => {
        resolve(response.ok);
      });
    });
  }

  // Send message
  sendMessage(messageData: SocketMessage): Promise<Message | null> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('send_message', messageData, (response: SocketCallbackResponse) => {
        if (response.ok && response.message) {
          resolve(response.message);
        } else {
          reject(new Error(response.error || 'Failed to send message'));
        }
      });
    });
  }

  // Typing indicator
  sendTypingIndicator(conversationId: string, isTyping: boolean): void {
    if (!this.socket?.connected) return;
    
    this.socket.emit('typing', { conversationId, isTyping });
  }

  // Mark messages as read
  markMessagesAsRead(conversationId: string, messageIds: string[]): void {
    if (!this.socket?.connected) return;

    this.socket.emit('mark_read', { conversationId, messageIds }, (response: SocketCallbackResponse) => {
      if (!response.ok) {
        console.error('Failed to mark messages as read:', response.error);
      }
    });
  }

  // Delivery acknowledgment
  sendDeliveryAck(messageId: string, conversationId: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit('delivery_ack', { messageId, conversationId });
  }

  // Get user online status
  getUserStatus(userId: string): Promise<'online' | 'offline'> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        resolve('offline');
        return;
      }

      this.socket.emit('get_status', { userId }, (response: { ok: boolean; status?: string }) => {
        resolve(response.ok && response.status === 'online' ? 'online' : 'offline');
      });
    });
  }

  // Event listeners
  onMessage(callback: (message: Message) => void): void {
    this.socket?.on('message', callback);
  }

  onTyping(callback: (data: TypingIndicator) => void): void {
    this.socket?.on('typing', callback);
  }

  onRead(callback: (data: ReadReceipt) => void): void {
    this.socket?.on('read', callback);
  }

  onMessageDelivered(callback: (data: DeliveryAck) => void): void {
    this.socket?.on('message_delivered', callback);
  }

  onNotification(callback: (notification: unknown) => void): void {
    this.socket?.on('notification', callback);
  }

  onUserOnline(callback: (data: UserPresence) => void): void {
    this.socket?.on('user_online', callback);
  }

  onUserOffline(callback: (data: UserPresence) => void): void {
    this.socket?.on('user_offline', callback);
  }

  // Generic event listeners
  on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }

  // Remove listeners
  off(event: string, callback?: (...args: unknown[]) => void): void {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  private handleConnectionError(error: Error): void {
    switch (error.message) {
      case 'NO_TOKEN':
        console.error('No authentication token provided');
        // Redirect to login or refresh token
        break;
      case 'AUTH_ERROR':
        console.error('Authentication failed - token expired or invalid');
        // Try to refresh token or redirect to login
        break;
      case 'USER_NOT_FOUND':
        console.error('User not found');
        break;
      case 'ACCOUNT_DELETED':
        console.error('Account has been deleted');
        break;
      default:
        console.error('Socket connection error:', error.message);
    }
  }
}

// Create singleton instance
export const socketService = new SocketService();