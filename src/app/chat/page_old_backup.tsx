'use client';

/**
 * Chat Page for Green Loop
 * Sustainable fashion community messaging
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import ChatAPI, { Conversation, ChatMessage } from '@/api/chat';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useVideoCall } from '@/contexts/VideoCallContext';
import { MessageCircle, Leaf, Users, Headset, Search, UserPlus, X, Video, Check, CheckCheck, Image as ImageIcon, Send } from 'lucide-react';
import { searchUsers } from '@/api';

interface UserSearchResult {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

export default function ChatPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { startVideoCall } = useVideoCall();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // User search states
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState(false);

  // WebSocket for selected conversation
  const { isConnected, lastMessage, lastReadReceipt } = useWebSocket(selectedConversation?.conversationId || null);

  // Video call handler - uses global video call context
  const handleStartVideoCall = async () => {
    if (!selectedConversation || !user) return;
    
    try {
      console.log('Starting video call with:', selectedConversation.otherUser.username);
      
      // Use global video call context to start call
      await startVideoCall(
        selectedConversation.conversationId,
        selectedConversation.otherUser.username || selectedConversation.otherUser.email
      );
    } catch (error) {
      console.error('Failed to start video call:', error);
      alert('Failed to start video call. Please try again.');
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const { conversations: userConvs } = await ChatAPI.getUserConversations();
        setConversations(userConvs);
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadConversations();
    }
  }, [user]);

  // Load messages when conversation is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversation) return;

      try {
        const { messages: chatMessages } = await ChatAPI.getChatHistory(
          selectedConversation.conversationId,
          0,
          50
        );
        // Reverse to show oldest first
        setMessages(chatMessages.reverse());
        
        // Mark messages as read
        await ChatAPI.markMessagesAsRead(selectedConversation.conversationId);
        
        // Update conversation list to clear unread count immediately
        setConversations((prevConvs) =>
          prevConvs.map(conv =>
            conv.conversationId === selectedConversation.conversationId
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();
  }, [selectedConversation]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      const isCurrentConversation = selectedConversation?.conversationId === lastMessage.conversationId;
      const isOwnMessage = lastMessage.sender?.userId === user?.userId;
      
      if (isCurrentConversation) {
        // Add message to current conversation
        setMessages((prev) => [...prev, lastMessage as any]);
        
        // Mark as read if it's not our own message
        if (!isOwnMessage) {
          ChatAPI.markMessagesAsRead(lastMessage.conversationId);
        }
      }
      
      // Update conversation list with new message
      setConversations((prevConvs) => {
        const updatedConvs = prevConvs.map(conv => {
          if (conv.conversationId === lastMessage.conversationId) {
            const isInCurrentConv = isCurrentConversation;
            const shouldIncrementUnread = !isOwnMessage && !isInCurrentConv;
            
            return {
              ...conv,
              lastActivity: lastMessage.sentAt,
              lastMessage: lastMessage.messageType === 'IMAGE' ? '📷 Image' : lastMessage.content?.substring(0, 50) + (lastMessage.content?.length > 50 ? '...' : ''),
              totalMessageCount: conv.totalMessageCount + 1,
              unreadCount: shouldIncrementUnread ? (conv.unreadCount || 0) + 1 : (isInCurrentConv ? 0 : conv.unreadCount)
            };
          }
          return conv;
        });
        
        // Re-sort by latest activity
        return updatedConvs.sort((a, b) => 
          new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
        );
      });
    }
  }, [lastMessage, selectedConversation, user]);

  // Handle read receipts
  useEffect(() => {
    if (lastReadReceipt) {
      // Update messages to mark as read
      setMessages((prevMessages) =>
        prevMessages.map((msg) => ({
          ...msg,
          isRead: true,
          readAt: lastReadReceipt.readAt
        }))
      );
      
      // Update conversation list: clear unread count AND show latest message
      setConversations((prevConvs) =>
        prevConvs.map(conv => {
          if (conv.conversationId === lastReadReceipt.conversationId) {
            // When all messages are read, show the latest message preview instead of unread count
            return { 
              ...conv, 
              unreadCount: 0
              // lastMessage is already set, so it will show the preview now that unread is 0
            };
          }
          return conv;
        })
      );
    }
  }, [lastReadReceipt]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !messageInput.trim() || sending) return;

    try {
      setSending(true);
      await ChatAPI.sendMessage(
        selectedConversation.conversationId,
        messageInput,
        'TEXT'
      );
      // Don't add to state here - WebSocket will handle it
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedConversation || !e.target.files?.[0]) return;

    try {
      setSending(true);
      await ChatAPI.sendImageMessage(
        selectedConversation.conversationId,
        e.target.files[0]
      );
      // Don't add to state here - WebSocket will handle it
    } catch (error) {
      console.error('Failed to send image:', error);
    } finally {
      setSending(false);
    }
  };

  // Search for users
  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await searchUsers(searchQuery);
      console.log('Search response:', response);
      
      // Handle the response structure - it's nested in data.data.content
      let users = [];
      if (response.data?.content) {
        users = response.data.content;
      } else if (response.content) {
        users = response.content;
      } else if (Array.isArray(response)) {
        users = response;
      }
      
      // Filter out current user
      const results = users.filter((u: any) => u.userId !== user?.userId);
      console.log('Filtered results:', results);
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search users:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Create conversation with selected user
  const handleCreateConversation = async (otherUserId: string) => {
    try {
      setCreatingConversation(true);
      const { conversation } = await ChatAPI.createConversation(otherUserId, false);
      
      // Add to conversations list if not already there
      setConversations((prev) => {
        const exists = prev.some(c => c.conversationId === conversation.conversationId);
        if (exists) return prev;
        return [conversation, ...prev];
      });
      
      // Select the new conversation
      setSelectedConversation(conversation);
      
      // Close modal and reset search
      setShowSearchModal(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      alert('Failed to create conversation. Please try again.');
    } finally {
      setCreatingConversation(false);
    }
  };

  // Create admin conversation
  const handleCreateAdminConversation = async () => {
    try {
      setCreatingConversation(true);
      // For admin conversation, we need to know the admin user ID
      // This should be configured in your backend or you can use a special endpoint
      const { conversation } = await ChatAPI.createConversation(user!.userId, true);
      
      setConversations((prev) => {
        const exists = prev.some(c => c.conversationId === conversation.conversationId);
        if (exists) return prev;
        return [conversation, ...prev];
      });
      
      setSelectedConversation(conversation);
    } catch (error) {
      console.error('Failed to create admin conversation:', error);
      alert('Failed to create admin support conversation. Please try again.');
    } finally {
      setCreatingConversation(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Leaf className="w-16 h-16 text-green-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading sustainable conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <MessageCircle className="w-10 h-10 text-green-600" />
              Green Loop Conversations
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Connect with the sustainable fashion community
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowSearchModal(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              New Chat
            </button>
            <button
              onClick={handleCreateAdminConversation}
              disabled={creatingConversation}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Headset className="w-5 h-5" />
              Contact Admin
            </button>
          </div>
        </div>

        {/* Chat Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversation List */}
          <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 bg-green-600 text-white">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Conversations
              </h2>
              {isConnected && (
                <span className="text-xs text-green-100">● Connected</span>
              )}
            </div>
            <div className="overflow-y-auto h-[calc(100%-60px)]">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Start chatting with community members!</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const unreadCount = conv.unreadCount || 0;
                  const lastMessage = conv.lastMessage || '';
                  const lastActivity = conv.lastActivity ? new Date(conv.lastActivity).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
                  
                  return (
                  <button
                    key={conv.conversationId}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 text-left border-b hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selectedConversation?.conversationId === conv.conversationId
                        ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-600'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {conv.isAdminConversation ? (
                        <Headset className="w-8 h-8 text-green-600" />
                      ) : (
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {conv.otherUser.username[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {conv.isAdminConversation ? 'Admin Support' : conv.otherUser.username}
                          </p>
                          {lastActivity && (
                            <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                              {lastActivity}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-sm truncate ${unreadCount > 0 ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                            {unreadCount > 0 ? `${unreadCount} new message${unreadCount > 1 ? 's' : ''}` : (lastMessage || 'No messages yet')}
                          </p>
                          {unreadCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-green-600 text-white text-xs rounded-full font-semibold whitespace-nowrap">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                  );
                })

              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-green-600 text-white flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {selectedConversation.isAdminConversation
                        ? 'Admin Support'
                        : selectedConversation.otherUser.username}
                    </h2>
                    <p className="text-sm text-green-100">
                      {selectedConversation.isAdminConversation
                        ? 'Get help with your sustainable fashion journey'
                        : selectedConversation.otherUser.email}
                    </p>
                  </div>
                  {!selectedConversation.isAdminConversation && selectedConversation.videoCallEnabled && (
                    <button
                      onClick={handleStartVideoCall}
                      className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2 font-semibold"
                      title="Start Video Call"
                    >
                      <Video className="w-5 h-5" />
                      Video Call
                    </button>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => {
                    const isOwnMessage = msg.sender?.userId === user?.userId;
                    return (
                      <div
                        key={msg.messageId}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isOwnMessage
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                          }`}
                        >
                          {msg.messageType === 'IMAGE' && msg.mediaUrl && (
                            <img
                              src={msg.mediaUrl}
                              alt="Shared image"
                              className="rounded-lg mb-2 max-w-full"
                            />
                          )}
                          {msg.messageType === 'TEXT' && <p>{msg.content}</p>}
                          {msg.messageType === 'SYSTEM' && (
                            <p className="italic text-sm">{msg.content}</p>
                          )}
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <p className="text-xs opacity-70">
                              {new Date(msg.sentAt).toLocaleTimeString()}
                            </p>
                            {isOwnMessage && (
                              <span className="text-xs opacity-70" title={msg.isRead ? "Read" : "Sent"}>
                                {msg.isRead ? (
                                  <CheckCheck className="w-4 h-4 inline text-blue-300" />
                                ) : (
                                  <Check className="w-4 h-4 inline" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      📷
                    </label>
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={sending || !messageInput.trim()}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Leaf className="w-24 h-24 mx-auto mb-4 text-gray-300" />
                  <p className="text-xl">Select a conversation to start chatting</p>
                  <p className="text-sm mt-2">
                    Connect with the sustainable fashion community
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Search Modal */}
        {showSearchModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              {/* Modal Header */}
              <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-green-600" />
                  Start New Conversation
                </h2>
                <button
                  onClick={() => {
                    setShowSearchModal(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Search Input */}
              <div className="p-6 border-b dark:border-gray-700">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchUsers()}
                      placeholder="Search by email or username..."
                      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <button
                    onClick={handleSearchUsers}
                    disabled={searching || !searchQuery.trim()}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {searching ? 'Searching...' : 'Search'}
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Find users by their email address or username
                </p>
              </div>

              {/* Search Results */}
              <div className="p-6 overflow-y-auto max-h-96">
                {searchResults.length === 0 && searchQuery && !searching && (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No users found matching "{searchQuery}"</p>
                    <p className="text-sm mt-2">Try searching by email or username</p>
                  </div>
                )}

                {searchResults.length === 0 && !searchQuery && (
                  <div className="text-center py-12 text-gray-500">
                    <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Search for users to start chatting</p>
                    <p className="text-sm mt-2">Enter an email or username above</p>
                  </div>
                )}

                {searching && (
                  <div className="text-center py-12">
                    <div className="animate-spin w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Searching for users...</p>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map((result) => (
                      <button
                        key={result.userId}
                        onClick={() => handleCreateConversation(result.userId)}
                        disabled={creatingConversation}
                        className="w-full p-4 border rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 transition-colors text-left flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {result.firstName[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {result.firstName} {result.lastName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            @{result.username || result.email}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {result.email}
                          </p>
                        </div>
                        <MessageCircle className="w-6 h-6 text-green-600" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

