// src/components/chat/MessageList.tsx
import React, { useEffect, useRef, useState } from 'react';
import type { Message } from '../../types';
import { useChat } from '../../hooks';
import { FiCheck, FiCheckCircle, FiDownload, FiX, FiExternalLink, FiImage } from 'react-icons/fi';

interface MessageListProps {
  messages: Message[];
  conversationId: string;
  currentUserId: string;
  // display names already resolved by parent (ChatPage)
  typingDisplayNames: string[];
  // whether to show user names in typing indicator (true for group chats)
  showTypingNames?: boolean;
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

  const handleAttachmentClick = (attachment: { url: string; name: string; size: number }, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent message details popup from opening
    
    // Check if URL is base64 data URL
    if (attachment.url.startsWith('data:')) {
      // For base64 data URLs, open in new tab
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>${attachment.name}</title></head>
            <body style="margin:0;padding:20px;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#1a1a1a;">
              ${attachment.url.includes('image/') 
                ? `<img src="${attachment.url}" alt="${attachment.name}" style="max-width:100%;max-height:100vh;object-fit:contain;" />`
                : attachment.url.includes('video/')
                ? `<video src="${attachment.url}" controls style="max-width:100%;max-height:100vh;" />`
                : attachment.url.includes('audio/')
                ? `<audio src="${attachment.url}" controls style="width:100%;" />`
                : `<iframe src="${attachment.url}" style="width:100%;height:100vh;border:none;" />`
              }
            </body>
          </html>
        `);
      }
    } else {
      // For regular URLs, open in new tab
      window.open(attachment.url, '_blank');
    }
  };

  const handleAttachmentDownload = (attachment: { url: string; name: string; size: number }, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent message details popup from opening
    
    // Convert base64 data URL to blob and download
    if (attachment.url.startsWith('data:')) {
      try {
        const response = fetch(attachment.url);
        response.then(res => res.blob()).then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = attachment.name;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        });
      } catch (error) {
        console.error('Error downloading file:', error);
        // Fallback: open in new tab
        window.open(attachment.url, '_blank');
      }
    } else {
      // For regular URLs, trigger download
      const a = document.createElement('a');
      a.href = attachment.url;
      a.download = attachment.name;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const isImageFile = (fileName: string, url: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const lowerName = fileName.toLowerCase();
    return imageExtensions.some(ext => lowerName.endsWith(ext)) || url.startsWith('data:image/');
  };

  return (
    <div className={`
      flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 group
      animate-fadeIn px-2
    `}>
      {!isOwn && showAvatar && (
        <div className="mr-2 mt-auto flex-shrink-0">
          {getSenderAvatar()}
        </div>
      )}
      
      <div className={`
        max-w-[75%] sm:max-w-[70%] ${isOwn ? 'order-2' : 'order-1'} flex flex-col
      `}>
        {!isOwn && showAvatar && (
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 ml-1 font-medium">
            {getSenderName()}
          </div>
        )}
        
        <div className="relative">
          <div
            onClick={() => setShowDetails(!showDetails)}
            className={`
              px-4 py-2.5 rounded-2xl cursor-pointer transition-all duration-300
              ${isOwn
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 backdrop-blur-sm border border-white/20 dark:border-gray-700/30'
              }
              hover:scale-[1.01] shadow-md hover:shadow-lg
              ${message.tempId ? 'opacity-70' : ''}
              break-words
            `}
          >
            {message.body && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.body}
              </p>
            )}
            
            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className={`${message.body ? 'mt-2' : ''} space-y-2`}>
                {message.attachments.map((attachment, index) => {
                  const isImage = isImageFile(attachment.name, attachment.url);
                  
                  return (
                    <div key={index} className="space-y-2">
                      {/* Image Preview */}
                      {isImage && attachment.url && (
                        <div 
                          onClick={(e) => handleAttachmentClick(attachment, e)}
                          className="cursor-pointer rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                        >
                          <img 
                            src={attachment.url} 
                            alt={attachment.name}
                            className="max-w-full max-h-64 object-contain rounded-lg"
                            onError={(e) => {
                              // Hide image if it fails to load
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      {/* File Info Card */}
                      <div 
                        onClick={(e) => handleAttachmentClick(attachment, e)}
                        className={`
                          flex items-center space-x-2 p-2 rounded-lg cursor-pointer
                          transition-all duration-200 hover:scale-[1.02]
                          ${isOwn 
                            ? 'bg-white/20 text-white hover:bg-white/30' 
                            : 'bg-black/10 dark:bg-white/10 text-gray-900 dark:text-gray-100 hover:bg-black/20 dark:hover:bg-white/20'
                          }
                        `}
                      >
                        {isImage ? (
                          <FiImage className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <FiDownload className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span className="text-sm truncate flex-1 min-w-0" title={attachment.name}>
                          {attachment.name}
                        </span>
                        <span className={`text-xs flex-shrink-0 ${isOwn ? 'text-white/80' : 'opacity-70'}`}>
                          {(attachment.size / 1024).toFixed(1)}KB
                        </span>
                        <button
                          onClick={(e) => handleAttachmentDownload(attachment, e)}
                          className={`
                            p-1 rounded hover:bg-white/20 transition-colors
                            ${isOwn ? 'text-white' : 'text-gray-600 dark:text-gray-400'}
                          `}
                          title="Download"
                        >
                          <FiDownload className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleAttachmentClick(attachment, e)}
                          className={`
                            p-1 rounded hover:bg-white/20 transition-colors
                            ${isOwn ? 'text-white' : 'text-gray-600 dark:text-gray-400'}
                          `}
                          title="Open"
                        >
                          <FiExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Message details popup - improved positioning */}
          {showDetails && (
            <>
              {/* Backdrop to close on click outside */}
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setShowDetails(false)}
              />
              <div className={`
                absolute ${isOwn ? 'right-0' : 'left-0'} top-full mt-2 p-3 rounded-xl z-50
                bg-white dark:bg-gray-800 backdrop-blur-xl
                border border-gray-200 dark:border-gray-700
                shadow-2xl min-w-[220px] max-w-[280px]
                animate-fadeIn
              `}>
                <div className="space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Message Info</span>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Sent:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{formatTime(message.createdAt)}</span>
                    </div>
                    
                    {isOwn && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Delivered:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {(message.deliveredTo || []).length > 0 ? (
                              <span className="text-green-500">✓ Yes</span>
                            ) : (
                              <span className="text-gray-400">Pending</span>
                            )}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Read:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {(message.readBy || []).length > 0 ? (
                              <span className="text-blue-500">✓ Read</span>
                            ) : (
                              <span className="text-gray-400">Unread</span>
                            )}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Time and status */}
        <div className={`
          flex items-center space-x-1 mt-1 text-xs text-gray-500 dark:text-gray-400
          ${isOwn ? 'justify-end mr-1' : 'justify-start ml-1'}
        `}>
          <span>{formatTime(message.createdAt)}</span>
          {getDeliveryStatus()}
          {message.tempId && (
            <span className="text-orange-500 ml-1">Sending...</span>
          )}
        </div>
      </div>
      
      {isOwn && showAvatar && (
        <div className="ml-2 mt-auto flex-shrink-0">
          {getSenderAvatar()}
        </div>
      )}
    </div>
  );
};

const TypingIndicator: React.FC<{ typingDisplayNames: string[]; showNames?: boolean }> = ({ typingDisplayNames, showNames = true }) => {
  if (typingDisplayNames.length === 0) return null;

  const text = (() => {
    if (!showNames) return 'typing...';
    if (typingDisplayNames.length === 1) return `${typingDisplayNames[0]} is typing...`;
    return `${typingDisplayNames.length} people are typing...`;
  })();

  return (
    <div className="flex items-center space-x-2 px-2 py-2 animate-fadeIn">
      <div className="flex space-x-1 ml-2">
        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400 italic">{text}</span>
    </div>
  );
};

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  conversationId,
  currentUserId,
  typingDisplayNames,
  showTypingNames = true,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { markAsRead } = useChat();

  useEffect(() => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.warn("Failed to scroll to bottom", error);
    }
  }, [messages, typingDisplayNames]);

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
      <div className="flex-1 flex items-center justify-center p-8 min-h-0">
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
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-transparent to-white/5 dark:to-gray-900/5 min-h-0">
      <div className="py-4">
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
        
        <TypingIndicator typingDisplayNames={typingDisplayNames} showNames={showTypingNames} />
        
        <div ref={messagesEndRef} className="h-2" />
      </div>
    </div>
  );
};