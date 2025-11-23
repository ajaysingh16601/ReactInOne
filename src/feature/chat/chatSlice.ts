// src/feature/chat/chatSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { 
  ChatState, 
  Conversation, 
  Message, 
  TypingIndicator
} from '../../types';
import { chatApi } from '../../api/chatApi';

const initialState: ChatState = {
  conversations: [],
  activeConversation: null,
  messages: {},
  typingUsers: {},
  onlineUsers: [],
  isConnected: false,
  loading: false,
  error: null,
};

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async () => {
    return await chatApi.getConversations();
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ conversationId, limit = 50, before }: { 
    conversationId: string; 
    limit?: number; 
    before?: string; 
  }) => {
    const messages = await chatApi.getMessages(conversationId, limit, before);
    return { conversationId, messages };
  }
);

export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async ({ participantIds, type, title }: {
    participantIds: string[];
    type: 'direct' | 'group';
    title?: string;
  }) => {
    return await chatApi.createConversation(participantIds, type, title);
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      if (!action.payload) {
        state.typingUsers = {};
        state.onlineUsers = [];
      }
    },

    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversation = action.payload;
    },

    addMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      const conversationId = message.conversation;
      if (!message.readBy) message.readBy = [];
      if (!message.deliveredTo) message.deliveredTo = [];
      
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      
      const existingIndex = state.messages[conversationId].findIndex(
        m => m._id === message._id || m.tempId === message.tempId
      );
      
      if (existingIndex >= 0) {
        state.messages[conversationId][existingIndex] = message;
      } else {
        state.messages[conversationId].push(message);
        state.messages[conversationId].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }

      const conversation = state.conversations.find(c => c._id === conversationId);
      if (conversation) {
        conversation.lastMessage = message;
        conversation.updatedAt = message.createdAt;
      }
    },

    updateMessage: (state, action: PayloadAction<{ tempId: string; message: Message }>) => {
      const { tempId, message } = action.payload;
      const conversationId = message.conversation;
      
      if (state.messages[conversationId]) {
        const messageIndex = state.messages[conversationId].findIndex(m => m.tempId === tempId);
        
        if (messageIndex >= 0) {
          const updatedMessage: Message = { ...message } as Message;
          delete (updatedMessage as any).tempId;
          if (!updatedMessage.readBy) updatedMessage.readBy = [];
          if (!updatedMessage.deliveredTo) updatedMessage.deliveredTo = [];

          state.messages[conversationId][messageIndex] = updatedMessage;
        } else {
          if (!message.readBy) message.readBy = [];
          if (!message.deliveredTo) message.deliveredTo = [];
          state.messages[conversationId].push(message);
        }
      } else {
        if (!message.readBy) message.readBy = [];
        if (!message.deliveredTo) message.deliveredTo = [];
        state.messages[conversationId] = [message];
      }
    },

    setTypingIndicator: (state, action: PayloadAction<TypingIndicator>) => {
      const { conversationId, userId, isTyping } = action.payload;
      
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }
      
      if (isTyping) {
        if (!state.typingUsers[conversationId].includes(userId)) {
          state.typingUsers[conversationId].push(userId);
        }
      } else {
        state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(id => id !== userId);
      }
    },

    clearTypingIndicator: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      if (state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }
    },

    markMessagesAsRead: (state, action: PayloadAction<{ conversationId: string; messageIds: string[]; userId: string }>) => {
      const { conversationId, messageIds, userId } = action.payload;
      
      if (state.messages[conversationId]) {
        state.messages[conversationId].forEach(message => {
          if (!message.readBy) message.readBy = [];
          if (messageIds.includes(message._id) && !message.readBy.includes(userId)) {
            message.readBy.push(userId);
          }
        });
      }
    },

    markMessageDelivered: (state, action: PayloadAction<{ conversationId: string; messageId: string; userId: string }>) => {
      const { conversationId, messageId, userId } = action.payload;
      
      if (state.messages[conversationId]) {
        const message = state.messages[conversationId].find(m => m._id === messageId);
        if (message) {
          if (!message.deliveredTo) message.deliveredTo = [];
          if (!message.deliveredTo.includes(userId)) {
            message.deliveredTo.push(userId);
          }
        }
      }
    },

    setUserOnline: (state, action: PayloadAction<string>) => {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },

    setUserOffline: (state, action: PayloadAction<string>) => {
      state.onlineUsers = state.onlineUsers.filter(userId => userId !== action.payload);
    },

    addConversation: (state, action: PayloadAction<Conversation>) => {
      const existing = state.conversations.find(c => c._id === action.payload._id);
      if (!existing) {
        state.conversations.unshift(action.payload);
      }
    },

    updateConversation: (state, action: PayloadAction<Conversation>) => {
      const index = state.conversations.findIndex(c => c._id === action.payload._id);
      if (index >= 0) {
        state.conversations[index] = action.payload;
      }
    },

    removeConversation: (state, action: PayloadAction<string>) => {
      state.conversations = state.conversations.filter(c => c._id !== action.payload);
      delete state.messages[action.payload];
      delete state.typingUsers[action.payload];
      
      if (state.activeConversation === action.payload) {
        state.activeConversation = null;
      }
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    resetChatState: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch conversations';
      })

      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { conversationId, messages } = action.payload;
        // Normalize message arrays to avoid runtime errors
        const normalized = (messages || []).map(m => ({
          ...m,
          readBy: m.readBy || [],
          deliveredTo: m.deliveredTo || [],
        }));

        state.messages[conversationId] = normalized.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch messages';
      })

      // Create conversation
      .addCase(createConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations.unshift(action.payload);
        state.activeConversation = action.payload._id;
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create conversation';
      });
  },
});

export const {
  setConnectionStatus,
  setActiveConversation,
  addMessage,
  updateMessage,
  setTypingIndicator,
  clearTypingIndicator,
  markMessagesAsRead,
  markMessageDelivered,
  setUserOnline,
  setUserOffline,
  addConversation,
  updateConversation,
  removeConversation,
  setError,
  clearError,
  resetChatState,
} = chatSlice.actions;

export default chatSlice.reducer;