// src/api/chatApi.ts
import { api } from './index';
import type { 
  Conversation, 
  Message 
} from '../types';

const CHAT_BASE_URL = '/chat';

export const chatApi = {
  async getConversations(): Promise<Conversation[]> {
    const url = `${CHAT_BASE_URL}/conversations`;
    try {
      const response = await api.get<{ ok: boolean; conversations?: Conversation[] }>(url);
      return response.data?.conversations || [];
    } catch (error: any) {
      throw error;
    }
  },

  async createConversation(participantIds: string[], type: 'direct' | 'group', title?: string): Promise<Conversation> {
    const payload = {
      participantIds,
      type,
      ...(title && { title })
    };
    const url = `${CHAT_BASE_URL}/conversations`;
    
    try {
      const response = await api.post<{ ok: boolean; conversation?: Conversation; error?: string }>(url, payload);
      
      if (response.data?.conversation) {
        return response.data.conversation;
      }
      throw new Error(response.data?.error || 'Failed to create conversation');
    } catch (error: any) {
      throw error;
    }
  },

  async getMessages(conversationId: string, limit = 50, before?: string): Promise<Message[]> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (before) params.append('before', before);
    
    const url = `${CHAT_BASE_URL}/conversations/${conversationId}/messages?${params}`;
    try {
      const response = await api.get<{ ok: boolean; messages?: Message[] }>(url);
      return response.data?.messages || [];
    } catch (error: any) {
      throw error;
    }
  },

  async updateGroupParticipants(
    conversationId: string, 
    add?: string[], 
    remove?: string[]
  ): Promise<void> {
    const payload: { add?: string[]; remove?: string[] } = {};
    if (add) payload.add = add;
    if (remove) payload.remove = remove;

    await api.put(`${CHAT_BASE_URL}/conversations/${conversationId}/participants`, payload);
  },

  async updateGroupDetails(conversationId: string, title?: string, avatar?: string): Promise<void> {
    const payload: { title?: string; avatar?: string } = {};
    if (title) payload.title = title;
    if (avatar) payload.avatar = avatar;

    await api.put(`${CHAT_BASE_URL}/conversations/${conversationId}`, payload);
  },

  async leaveGroup(conversationId: string): Promise<void> {
    await api.delete(`${CHAT_BASE_URL}/conversations/${conversationId}/leave`);
  }
};