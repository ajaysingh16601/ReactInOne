// src/components/chat/MessageList.tsx
import React, { useEffect, useRef, useState } from 'react';
import type { Message } from '../../types';
import { useChat } from '../../hooks';
import { FiCheck, FiCheckCircle, FiDownload } from 'react-icons/fi';

interface MessageListProps {
  messages: Message[];
  conversationId: string;
  currentUserId: string;
  typingUsers: string[];
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isOwn, 
  showAvatar
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getDeliveryStatus = (): React.ReactNode => {
    if (!isOwn) return null;
    
    const deliveredTo = message.deliveredTo || [];
    const readBy = message.readBy || [];
    
    const isDelivered = deliveredTo.length > 0;
    const isRead = readBy.length > 0;
    
    if (isRead) {
      return <FiCheckCircle className="w-4 h-4 text-blue-500" />;
    } else if (isDelivered) {
      return <FiCheck className="w-4 h-4 text-gray-500" />;
    } else {
      return <FiCheck className="w-4 h-4 text-gray-300" />;
    }
  };

  const getSenderName = (): string => {
    if (typeof message.sender === 'object') {
      return message.sender.name;
    }
    return 'Unknown User';
  };

  const getSenderAvatar = (): React.ReactNode => {
    const name = getSenderName();
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
    
    return (
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white
        ${isOwn 
          ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
          : 'bg-gradient-to-br from-blue-500 to-cyan-500'
        }
      `}>
        {initials}
      </div>
    );
  };

  return (
    <div className={`
      flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group
      animate-fadeIn
    `}>
      {!isOwn && showAvatar && (
        <div className="mr-2 mt-auto">
          {getSenderAvatar()}
        </div>
      )}
      
      <div className={`
        max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}
      `}>
        {!isOwn && showAvatar && (
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 ml-2">
            {getSenderName()}
          </div>
        )}
        
        <div className="relative">
          <div
            onClick={() => setShowDetails(!showDetails)}
            className={`
              px-4 py-2 rounded-2xl cursor-pointer transition-all duration-300
              ${isOwn
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white ml-auto'
                : 'bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 backdrop-blur-sm border border-white/20 dark:border-gray-700/30'
              }
              hover:scale-[1.02] shadow-lg
              ${message.tempId ? 'opacity-70' : ''}
            `}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.body}
            </p>
            
            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment, index) => (
                  <div key={index} className="
                    flex items-center space-x-2 p-2 rounded-lg
                    bg-black/10 dark:bg-white/10
                  ">
                    <FiDownload className="w-4 h-4" />
                    <span className="text-sm truncate flex-1">
                      {attachment.name}
                    </span>
                    <span className="text-xs opacity-70">
                      {(attachment.size / 1024).toFixed(1)}KB
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Message details */}
          {showDetails && (
            <div className={`
              absolute top-full mt-2 p-3 rounded-lg z-10
              bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl
              border border-white/20 dark:border-gray-700/30
              shadow-xl min-w-[200px]
              ${isOwn ? 'right-0' : 'left-0'}
              animate-fadeIn
            `}>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Sent:</span>
                  <span className="font-medium">{formatTime(message.createdAt)}</span>
                </div>
                
                {isOwn && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Delivered:</span>
                      <span className="font-medium">
                        {(message.deliveredTo || []).length > 0 ? '✓' : 'Pending'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Read:</span>
                      <span className="font-medium">
                        {(message.readBy || []).length > 0 ? '✓' : 'Unread'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Time and status */}
        <div className={`
          flex items-center space-x-1 mt-1 text-xs text-gray-500 dark:text-gray-400
          ${isOwn ? 'justify-end' : 'justify-start'}
        `}>
          <span>{formatTime(message.createdAt)}</span>
          {getDeliveryStatus()}
          {message.tempId && (
            <span className="text-orange-500">Sending...</span>
          )}
        </div>
      </div>
      
      {isOwn && showAvatar && (
        <div className="ml-2 mt-auto">
          {getSenderAvatar()}
        </div>
      )}
    </div>
  );
};

const TypingIndicator: React.FC<{ typingUsers: string[] }> = ({ typingUsers }) => {
  if (typingUsers.length === 0) return null;
  
  return (
    <div className="flex items-center space-x-2 p-4 animate-fadeIn">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {typingUsers.length === 1 
          ? `${typingUsers[0]} is typing...`
          : `${typingUsers.length} people are typing...`
        }
      </span>
    </div>
  );
};

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  conversationId,
  currentUserId,
  typingUsers,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { markAsRead } = useChat();

  useEffect(() => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.warn("Failed to scroll to bottom", error);
    }
  }, [messages, typingUsers]);

  useEffect(() => {
    if (!messages || !Array.isArray(messages)) return;
    
    const unreadMessages = messages
      .filter(msg => {
        const readBy = msg.readBy || [];
        return !readBy.includes(currentUserId);
      })
      .map(msg => msg._id);
    
    if (unreadMessages.length > 0) {
      const timeoutId = setTimeout(() => {
        markAsRead(conversationId, unreadMessages);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [messages, conversationId, currentUserId, markAsRead]);

  if (!messages || !Array.isArray(messages)) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-red-500">
          Error loading messages
        </div>
      </div>
    );
  }

  const messagesWithAvatars = messages.map((message, index) => {
    const prevMessage = messages[index - 1];
    const showAvatar = !prevMessage || (
      (prevMessage && typeof prevMessage.sender === 'object' && typeof message.sender === 'object')
        ? prevMessage.sender._id !== message.sender._id
        : (prevMessage ? prevMessage.sender !== message.sender : true)
    );
    
    return { ...message, showAvatar };
  });

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Start the conversation
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Send your first message to get the chat started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-transparent to-white/5">
      <div className="space-y-1">
        {messagesWithAvatars.map((message, index) => (
          <MessageBubble
            key={message._id || message.tempId || `msg-${index}-${message.createdAt}`}
            message={message}
            isOwn={typeof message.sender === 'object' 
              ? message.sender._id === currentUserId 
              : message.sender === currentUserId
            }
            showAvatar={message.showAvatar}
          />
        ))}
        
        <TypingIndicator typingUsers={typingUsers} />
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};