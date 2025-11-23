// Base types
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
}

// Chat types
export interface Attachment {
  url: string;
  name: string;
  size: number;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: User | string;
  body: string;
  attachments: Attachment[];
  readBy: string[];
  deliveredTo: string[];
  createdAt: string;
  updatedAt: string;
  tempId?: string; // For optimistic updates
}

export interface Conversation {
  _id: string;
  type: 'direct' | 'group';
  title?: string;
  participants: (User | string)[];
  lastMessage?: Message;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Socket event types
export interface SocketMessage {
  conversationId: string;
  body: string;
  tempId?: string;
  attachments?: Attachment[];
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface ReadReceipt {
  conversationId: string;
  messageIds: string[];
  userId: string;
}

export interface DeliveryAck {
  messageId: string;
  conversationId: string;
  userId: string;
}

export interface UserPresence {
  userId: string;
  status: 'online' | 'offline';
}

// API Response types
export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

export type ConversationResponse = ApiResponse<{ conversations: Conversation[] }>
export type MessagesResponse = ApiResponse<{ messages: Message[] }>
export type ConversationCreateResponse = ApiResponse<{ conversation: Conversation }>;

// Chat state types
export interface ChatState {
  conversations: Conversation[];
  activeConversation: string | null;
  messages: { [conversationId: string]: Message[] };
  typingUsers: { [conversationId: string]: string[] }; // Changed from Set to array for Redux serialization
  onlineUsers: string[]; // Changed from Set to array for Redux serialization
  isConnected: boolean;
  loading: boolean;
  error: string | null;
}

export interface SocketCallbackResponse {
  ok: boolean;
  message?: Message;
  error?: string;
}