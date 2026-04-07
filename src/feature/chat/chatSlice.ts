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
      
      // Helper to get sender ID for comparison
      const getSenderId = (msg: Message): string => {
        if (typeof msg.sender === 'object' && msg.sender?._id) {
          return String(msg.sender._id);
        }
        return String(msg.sender || '');
      };
      
      const incomingSenderId = getSenderId(message);
      
      // First, check if message already exists by _id (server ID) - highest priority
      const existingById = message._id 
        ? state.messages[conversationId].findIndex(m => m._id === message._id)
        : -1;
      
      if (existingById >= 0) {
        // Message with this _id already exists, just update it
        const existing = state.messages[conversationId][existingById];
        const updatedMessage = {
          ...message,
          // Preserve tempId if it exists in the existing message and new message doesn't have one
          tempId: message.tempId || existing.tempId,
        };
        state.messages[conversationId][existingById] = updatedMessage;
        
        // Update conversation last message
        const conversation = state.conversations.find(c => c._id === conversationId);
        if (conversation) {
          conversation.lastMessage = updatedMessage;
          conversation.updatedAt = updatedMessage.createdAt;
        }
        return; // Exit early, message already exists
      }
      
      // Second, check if message exists by tempId
      const existingByTempId = message.tempId
        ? state.messages[conversationId].findIndex(m => m.tempId === message.tempId)
        : -1;
      
      if (existingByTempId >= 0) {
        // Update existing temp message with real message data
        const updatedMessage = {
          ...message,
          // Remove tempId since we now have a real _id
          tempId: message._id ? undefined : message.tempId,
        };
        state.messages[conversationId][existingByTempId] = updatedMessage;
        
        // Re-sort to ensure correct order
        state.messages[conversationId].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        
        // Update conversation last message
        const conversation = state.conversations.find(c => c._id === conversationId);
        if (conversation) {
          conversation.lastMessage = updatedMessage;
          conversation.updatedAt = updatedMessage.createdAt;
        }
        return; // Exit early, temp message updated
      }
      
      // Third, if message has a real _id but no tempId, check if there's a temp message
      // from the same sender with matching content that should be replaced
      if (message._id && !message.tempId) {
        const tempMessageIndex = state.messages[conversationId].findIndex(m => {
          // Check if it's a temp message from the same sender
          if (!m.tempId) return false;
          const tempSenderId = getSenderId(m);
          if (tempSenderId !== incomingSenderId) return false;
          
          // Check if content matches (body and attachments)
          const bodyMatches = m.body === message.body;
          const attachmentsMatch = JSON.stringify(m.attachments || []) === JSON.stringify(message.attachments || []);
          
          // Check if timestamps are close (within 5 seconds) - handles rapid messages
          const timeDiff = Math.abs(
            new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()
          );
          const timeMatches = timeDiff < 5000; // 5 seconds
          
          return bodyMatches && attachmentsMatch && timeMatches;
        });
        
        if (tempMessageIndex >= 0) {
          // Replace temp message with real message
          const updatedMessage = {
            ...message,
            tempId: undefined, // Remove tempId since we have real _id
          };
          state.messages[conversationId][tempMessageIndex] = updatedMessage;
          
          // Re-sort to ensure correct order
          state.messages[conversationId].sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          
          // Update conversation last message
          const conversation = state.conversations.find(c => c._id === conversationId);
          if (conversation) {
            conversation.lastMessage = updatedMessage;
            conversation.updatedAt = updatedMessage.createdAt;
          }
          return; // Exit early, temp message replaced
        }
      }
      
      // If we get here, this is a genuinely new message - add it
      state.messages[conversationId].push(message);
      // Sort by creation time
      state.messages[conversationId].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Update conversation last message
      const conversation = state.conversations.find(c => c._id === conversationId);
      if (conversation) {
        conversation.lastMessage = message;
        conversation.updatedAt = message.createdAt;
      }
    },

    updateMessage: (state, action: PayloadAction<{ tempId: string; message: Message }>) => {
      const { tempId, message } = action.payload;
      const conversationId = message.conversation;
      
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      
      // First check if message with this _id already exists (socket might have already added it)
      if (message._id) {
        const existingById = state.messages[conversationId].findIndex(m => m._id === message._id);
        if (existingById >= 0) {
          // Message already exists (likely from socket broadcast), just ensure it's up to date
          const existing = state.messages[conversationId][existingById];
          const updatedMessage: Message = {
            ...message,
            // Preserve any tempId if it exists in the existing message
            tempId: existing.tempId || undefined,
          };
          delete (updatedMessage as any).tempId; // Remove tempId since we have real _id
          if (!updatedMessage.readBy) updatedMessage.readBy = [];
          if (!updatedMessage.deliveredTo) updatedMessage.deliveredTo = [];
          
          state.messages[conversationId][existingById] = updatedMessage;
          
          // Re-sort to ensure correct order
          state.messages[conversationId].sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          return; // Exit early, message already exists
        }
      }
      
      // Find message by tempId
      const messageIndex = state.messages[conversationId].findIndex(m => m.tempId === tempId);
      
      if (messageIndex >= 0) {
        // Update existing temp message with server response
        const updatedMessage: Message = { 
          ...message,
          // Remove tempId since we now have a real _id
        } as Message;
        delete (updatedMessage as any).tempId;
        if (!updatedMessage.readBy) updatedMessage.readBy = [];
        if (!updatedMessage.deliveredTo) updatedMessage.deliveredTo = [];

        state.messages[conversationId][messageIndex] = updatedMessage;
        
        // Re-sort to ensure correct order
        state.messages[conversationId].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      } else {
        // If temp message not found, check if message already exists by _id before adding
        if (message._id) {
          const existingById = state.messages[conversationId].findIndex(m => m._id === message._id);
          if (existingById >= 0) {
            // Message already exists, just update it
            const existing = state.messages[conversationId][existingById];
            const updatedMessage: Message = {
              ...message,
              tempId: existing.tempId || undefined,
            };
            delete (updatedMessage as any).tempId;
            if (!updatedMessage.readBy) updatedMessage.readBy = [];
            if (!updatedMessage.deliveredTo) updatedMessage.deliveredTo = [];
            
            state.messages[conversationId][existingById] = updatedMessage;
            state.messages[conversationId].sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            return;
          }
        }
        
        // If not found anywhere, add as new message (shouldn't happen normally)
        if (!message.readBy) message.readBy = [];
        if (!message.deliveredTo) message.deliveredTo = [];
        state.messages[conversationId].push(message);
        state.messages[conversationId].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
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