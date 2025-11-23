// src/pages/ChatPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ConversationList } from '../components/chat/ConversationList';
import { MessageList } from '../components/chat/MessageList';
import { MessageInput } from '../components/chat/MessageInput';
import { useChat, useSocket, useUsers } from '../hooks';
import { FiUsers, FiPhone, FiVideo, FiInfo } from 'react-icons/fi';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (participantIds: string[], type: 'direct' | 'group', title?: string) => void;
  currentUserId: string;
}

const NewConversationModal: React.FC<NewConversationModalProps> = ({
  isOpen,
  onClose,
  onCreateConversation,
  currentUserId,
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [conversationType, setConversationType] = useState<'direct' | 'group'>('direct');
  const [groupTitle, setGroupTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { users, loading: usersLoading, error: usersError, searchUsers, loadUsers } = useUsers();
  
  const availableUsers = users.filter(user => 
    user._id !== currentUserId && !selectedUsers.includes(user._id)
  );

  React.useEffect(() => {
    if (isOpen) {
      // loadUsers({ exclude: [currentUserId] });
    }
  }, [isOpen, currentUserId]);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchUsers(searchTerm, [currentUserId, ...selectedUsers]);
      } else {
        loadUsers({ exclude: [currentUserId] });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, currentUserId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedUsers.length === 0) return;
    
    const title = conversationType === 'group' ? groupTitle : undefined;
    onCreateConversation(selectedUsers, conversationType, title);
    
    setSelectedUsers([]);
    setConversationType('direct');
    setGroupTitle('');
    setSearchTerm('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="
        w-full max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl
        rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30
        animate-fadeIn
      ">
        <div className="p-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            New Conversation
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Conversation Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Conversation Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="direct"
                    checked={conversationType === 'direct'}
                    onChange={(e) => setConversationType(e.target.value as 'direct')}
                    className="mr-2"
                  />
                  <span className="text-sm">Direct Chat</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="group"
                    checked={conversationType === 'group'}
                    onChange={(e) => setConversationType(e.target.value as 'group')}
                    className="mr-2"
                  />
                  <span className="text-sm">Group Chat</span>
                </label>
              </div>
            </div>

            {/* Group Title */}
            {conversationType === 'group' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Group Title
                </label>
                <input
                  type="text"
                  value={groupTitle}
                  onChange={(e) => setGroupTitle(e.target.value)}
                  placeholder="Enter group name..."
                  className="
                    w-full px-3 py-2 rounded-lg
                    bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm
                    border border-white/20 dark:border-gray-700/30
                    focus:outline-none focus:ring-2 focus:ring-purple-500/50
                    text-gray-900 dark:text-gray-100
                  "
                  required
                />
              </div>
            )}

            {/* User Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Users
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="
                  w-full px-3 py-2 rounded-lg
                  bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm
                  border border-white/20 dark:border-gray-700/30
                  focus:outline-none focus:ring-2 focus:ring-purple-500/50
                  text-gray-900 dark:text-gray-100
                "
              />
            </div>

            {/* User Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Users {conversationType === 'direct' ? '(1)' : '(2 or more)'}
              </label>
              
              {/* Error State */}
              {usersError && (
                <div className="text-red-500 text-sm mb-2 p-2 bg-red-500/10 rounded-lg">
                  {usersError}
                </div>
              )}
              
              {/* Loading State */}
              {usersLoading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Loading users...</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableUsers.length === 0 ? (
                    <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'No users found matching your search.' : 'No users available.'}
                    </div>
                  ) : (
                    availableUsers.map((user) => (
                      <label key={user._id} className="flex items-center p-2 rounded-lg hover:bg-white/30 dark:hover:bg-gray-800/30 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (conversationType === 'direct') {
                                setSelectedUsers([user._id]);
                              } else {
                                setSelectedUsers(prev => [...prev, user._id]);
                              }
                            } else {
                              setSelectedUsers(prev => prev.filter(id => id !== user._id));
                            }
                          }}
                          className="mr-3 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-gray-100">{user.name || 'Unknown User'}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{user.email || 'No email'}</div>
                          </div>
                          {user.isOnline && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="
                  flex-1 px-4 py-2 rounded-lg
                  bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600
                  text-gray-900 dark:text-gray-100 transition-colors duration-300
                "
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={selectedUsers.length === 0 || (conversationType === 'group' && !groupTitle.trim())}
                className="
                  flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500
                  text-white font-semibold hover:scale-105 transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                "
              >
                Create Chat
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const ChatPage: React.FC = () => {
  const { connectSocket, isConnected } = useSocket();
  const { currentUser, loadCurrentUser } = useUsers();
  const {
    conversations,
    activeConversation,
    messages,
    loadConversations,
    joinConversation,
    sendMessage,
    createNewConversation,
    getTypingUsers,
    loading,
    error,
  } = useChat();

  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    
    const initializeChat = async () => {
      const token = localStorage.getItem('accessToken');

      if (token && !isInitialized.current) {
        isInitialized.current = true;
        try {
          loadCurrentUser();
          await connectSocket(token);
          loadConversations();
        } catch (error) {
          console.error('Failed to initialize chat:', error);
          isInitialized.current = false;
        }
      }
    };

    initializeChat();
  }, []);

  const activeConversationData = conversations.find(c => c._id === activeConversation);
  const activeMessages = activeConversation ? messages[activeConversation] || [] : [];
  const typingUsers = activeConversation ? getTypingUsers(activeConversation) : [];

  const handleConversationSelect = (conversationId: string) => {
    joinConversation(conversationId);
    setIsMobileMenuOpen(false);
  };

  const handleSendMessage = (messageBody: string, attachments: File[] = []) => {
    if (activeConversation) {
      sendMessage(activeConversation, messageBody, attachments);
    }
  };

  const handleNewConversation = async (participantIds: string[], type: 'direct' | 'group', title?: string) => {
    try {
      await createNewConversation(participantIds, type, title);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const getConversationTitle = (): string => {
    if (!activeConversationData) return 'Select a conversation';
    
    if (activeConversationData.title) return activeConversationData.title;
    
    if (activeConversationData.type === 'direct') {
      return 'Direct Chat';
    }
    
    return 'Group Chat';
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      {/* Conversation List - Desktop Sidebar */}
      <div className={`
        w-80 border-r border-white/20 dark:border-gray-700/30
        ${isMobileMenuOpen ? 'block' : 'hidden'} lg:block
        lg:relative absolute inset-y-0 left-0 z-30
      `}>
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversation}
          onConversationSelect={handleConversationSelect}
          onNewConversation={() => setShowNewConversationModal(true)}
          currentUserId={currentUser?._id || ''}
        />
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/30 flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-white/30 dark:hover:bg-gray-800/30 rounded-lg transition-colors duration-300"
            >
              <FiUsers className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {getConversationTitle()}
              </h1>
              {activeConversationData && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                  
                  {typingUsers.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-purple-500">
                        {typingUsers.length === 1 ? 'Someone is typing...' : 'Multiple people are typing...'}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chat Actions */}
          {activeConversationData && (
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-white/30 dark:hover:bg-gray-800/30 rounded-lg transition-all duration-300 hover:scale-105">
                <FiPhone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 hover:bg-white/30 dark:hover:bg-gray-800/30 rounded-lg transition-all duration-300 hover:scale-105">
                <FiVideo className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 hover:bg-white/30 dark:hover:bg-gray-800/30 rounded-lg transition-all duration-300 hover:scale-105">
                <FiInfo className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          )}
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {activeConversation ? (
            <>
              <MessageList
                messages={activeMessages}
                conversationId={activeConversation}
                currentUserId={currentUser?._id || ''}
                typingUsers={typingUsers}
              />
              <MessageInput
                conversationId={activeConversation}
                onSendMessage={handleSendMessage}
                disabled={!isConnected}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">💬</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Welcome to Chat
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Select a conversation from the sidebar or start a new chat to begin messaging.
                </p>
                <button
                  onClick={() => setShowNewConversationModal(true)}
                  className="
                    px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500
                    text-white font-semibold hover:scale-105 transition-all duration-300
                    shadow-lg hover:shadow-purple-500/25
                  "
                >
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading/Error States */}
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex items-center space-x-3 px-6 py-3 rounded-xl bg-white/90 dark:bg-gray-800/90 shadow-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
              <span className="text-gray-900 dark:text-gray-100">Loading...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-4 right-4 z-20">
            <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm shadow-lg animate-fadeIn">
              {error}
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        onCreateConversation={handleNewConversation}
        currentUserId={currentUser?._id || ''}
      />
    </div>
  );
};