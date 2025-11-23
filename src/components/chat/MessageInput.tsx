// src/components/chat/MessageInput.tsx
import React, { useState, useRef, useCallback } from 'react';
import { FiSend, FiPaperclip, FiSmile } from 'react-icons/fi';
import { useChat } from '../../hooks';

interface MessageInputProps {
  conversationId: string;
  onSendMessage: (message: string, attachments: File[]) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  conversationId,
  onSendMessage,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { handleStartTyping, handleStopTyping, isTyping } = useChat();

  const handleInputChange = useCallback((value: string) => {
    setMessage(value);
    
    if (value.trim() && !isTyping) {
      handleStartTyping(conversationId);
    } else if (!value.trim() && isTyping) {
      handleStopTyping(conversationId);
    }
  }, [conversationId, isTyping, handleStartTyping, handleStopTyping]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120); // Max 120px
      textarea.style.height = `${newHeight}px`;
    }
  };

  const handleSend = useCallback(() => {
    if (!message.trim() && attachments.length === 0) return;
    if (disabled) return;

    onSendMessage(message.trim(), attachments);
    setMessage('');
    setAttachments([]);
    handleStopTyping(conversationId);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }, 0);
  }, [message, attachments, disabled, onSendMessage, conversationId, handleStopTyping]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/', 'video/', 'audio/', 'application/pdf', 'text/'];

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
        return false;
      }
      
      if (!allowedTypes.some(type => file.type.startsWith(type))) {
        alert(`File type "${file.type}" is not supported.`);
        return false;
      }
      
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-white/20 dark:border-gray-700/30">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="
                flex items-center space-x-2 px-3 py-2 rounded-lg
                bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/30
                backdrop-blur-sm animate-fadeIn
              "
            >
              <FiPaperclip className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                {file.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(file.size)}
              </span>
              <button
                onClick={() => removeAttachment(index)}
                className="
                  w-5 h-5 rounded-full bg-red-500 text-white text-xs
                  hover:bg-red-600 transition-colors duration-200
                  flex items-center justify-center
                "
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end space-x-3">
        {/* Attachment Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="
            p-2 rounded-lg transition-all duration-300
            hover:bg-white/30 dark:hover:bg-gray-800/30
            text-gray-600 dark:text-gray-400 hover:text-purple-500
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <FiPaperclip className="w-5 h-5" />
        </button>

        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              handleInputChange(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={disabled}
            className="
              w-full px-4 py-3 pr-12 rounded-xl resize-none
              bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm
              border border-white/20 dark:border-gray-700/30
              focus:outline-none focus:ring-2 focus:ring-purple-500/50
              transition-all duration-300
              placeholder-gray-400 dark:placeholder-gray-500
              text-gray-900 dark:text-gray-100
              disabled:opacity-50 disabled:cursor-not-allowed
              min-h-[48px] max-h-[120px]
            "
            rows={1}
          />

          {/* Emoji Button */}
          <button
            onClick={() => {
            }}
            disabled={disabled}
            className="
              absolute right-3 top-1/2 transform -translate-y-1/2
              p-1 rounded-lg transition-all duration-300
              hover:bg-white/30 dark:hover:bg-gray-800/30
              text-gray-600 dark:text-gray-400 hover:text-purple-500
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <FiSmile className="w-5 h-5" />
          </button>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && attachments.length === 0)}
          className="
            p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500
            text-white shadow-lg transition-all duration-300
            hover:scale-105 hover:shadow-purple-500/25
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            flex items-center justify-center
          "
        >
          <FiSend className="w-5 h-5" />
        </button>
      </div>

      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.txt,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Connection Status */}
      {disabled && (
        <div className="mt-2 text-center">
          <span className="text-xs text-red-500 bg-red-500/10 px-2 py-1 rounded-full">
            Disconnected - Reconnecting...
          </span>
        </div>
      )}
    </div>
  );
};