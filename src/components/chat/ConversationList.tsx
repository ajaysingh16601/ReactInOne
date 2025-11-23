// src/components/chat/ConversationList.tsx
import React, { useState } from 'react';
import type { Conversation, User } from '../../types';
import { useChat } from '../../hooks';
import { useUsers } from '../../hooks';
import { FiSearch, FiPlus, FiUsers, FiUser } from 'react-icons/fi';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onConversationSelect: (conversationId: string) => void;
  onNewConversation: () => void;
  currentUserId: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onConversationSelect,
  onNewConversation,
  currentUserId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { getUnreadCount } = useChat();
  const { users } = useUsers();

  const filteredConversations = conversations.filter(conversation => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    if (conversation.title?.toLowerCase().includes(searchLower)) return true;
    
    return false;
  });

  const getConversationTitle = (conversation: Conversation): string => {
    if (conversation.title) return conversation.title;
    
    if (conversation.type === 'direct' && conversation.participants) {
      const otherParticipant = conversation.participants.find(p => 
        typeof p === 'object' ? p._id !== currentUserId : p !== currentUserId
      );
      
      if (otherParticipant) {
        if (typeof otherParticipant === 'object') {
          return otherParticipant.name || 'User';
        }
        const user = users.find((u: User) => u._id === otherParticipant);
        return user ? (user.name || 'User') : 'User';
      }
    }
    
    return conversation.type === 'direct' ? 'Direct Chat' : 'Group Chat';
  };

  const getConversationAvatar = (conversation: Conversation): React.ReactNode => {
    const isOnline = false;
    
    return (
      <div className="relative">
        <div className={`
          w-12 h-12 rounded-full flex items-center justify-center
          bg-gradient-to-br from-purple-500 to-pink-500
          text-white font-semibold text-lg shadow-lg
        `}>
          {conversation.type === 'group' ? (
            <FiUsers className="w-6 h-6" />
          ) : (
            <FiUser className="w-6 h-6" />
          )}
        </div>
        {isOnline && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>
    );
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/30">
      {/* Header */}
      <div className="p-4 border-b border-white/20 dark:border-gray-700/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Messages
          </h2>
          <button
            onClick={onNewConversation}
            className="
              p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500
              text-white hover:scale-105 transition-all duration-300
              shadow-lg hover:shadow-purple-500/25
            "
          >
            <FiPlus className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              w-full pl-10 pr-4 py-2 rounded-xl
              bg-white/50 dark:bg-gray-800/50
              border border-white/20 dark:border-gray-700/30
              backdrop-blur-sm
              focus:outline-none focus:ring-2 focus:ring-purple-500/50
              transition-all duration-300
              placeholder-gray-400 dark:placeholder-gray-500
              text-gray-900 dark:text-gray-100
            "
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conversation, index) => {
          const unreadCount = getUnreadCount(conversation);
          const isActive = conversation._id === activeConversationId;
          
          return (
            <div
              key={conversation._id}
              onClick={() => onConversationSelect(conversation._id)}
              className={`
                p-4 cursor-pointer transition-all duration-300 group
                border-b border-white/10 dark:border-gray-700/20
                hover:bg-white/30 dark:hover:bg-gray-800/30
                ${isActive ? 
                  'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-r-2 border-purple-500' : 
                  ''
                }
                animate-fadeIn
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center space-x-3">
                {getConversationAvatar(conversation)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`
                      font-semibold truncate
                      ${isActive ? 
                        'text-purple-600 dark:text-purple-400' : 
                        'text-gray-900 dark:text-gray-100'
                      }
                    `}>
                      {getConversationTitle(conversation)}
                    </h3>
                    
                    <div className="flex items-center space-x-2">
                      {conversation.updatedAt && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(conversation.updatedAt)}
                        </span>
                      )}
                      {unreadCount > 0 && (
                        <div className="
                          min-w-[20px] h-5 px-1.5 rounded-full
                          bg-gradient-to-r from-purple-500 to-pink-500
                          text-white text-xs font-semibold
                          flex items-center justify-center
                          animate-pulse
                        ">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {conversation.lastMessage && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                      {typeof conversation.lastMessage === 'object' 
                        ? conversation.lastMessage.body 
                        : 'New message'
                      }
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredConversations.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
              <FiUsers className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Start a new conversation to get chatting'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={onNewConversation}
                className="
                  px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500
                  text-white font-semibold hover:scale-105 transition-all duration-300
                  shadow-lg hover:shadow-purple-500/25
                "
              >
                Start New Chat
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};