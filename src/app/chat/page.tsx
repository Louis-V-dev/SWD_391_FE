'use client';

/**
 * Enhanced Chat Page for Green Loop
 * Features: Multi-image upload, delete/edit messages, date separators, infinite scroll, themed UI
 */

import { Suspense, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import ChatAPI, { Conversation, ChatMessage } from '@/api/chat';
import { useWebSocket, useConversationUpdates } from '@/hooks/useWebSocket';
import { useVideoCall } from '@/contexts/VideoCallContext';
import { 
  MessageCircle, Leaf, Users, Headset, Search, UserPlus, X, Video, 
  Check, CheckCheck, Image as ImageIcon, Send, MoreVertical, Edit2, 
  Trash2, Download
} from 'lucide-react';
import { searchUsers } from '@/api';
import { ImageLightbox } from '@/components/ImageLightbox';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface UserSearchResult {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface MessageGroup {
  type: 'date' | 'message';
  date?: string;
  message?: ChatMessage;
}

function ChatPageContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startVideoCall } = useVideoCall();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  
  // UI states
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const prefillHandledRef = useRef<string | null>(null);
  const conversationIdParam = useMemo(
    () => searchParams?.get('conversationId'),
    [searchParams]
  );
  const startWithUserParam = useMemo(
    () => searchParams?.get('startWithUser'),
    [searchParams]
  );

  // WebSocket for selected conversation
  const { isConnected, lastMessage, lastReadReceipt } = useWebSocket(selectedConversation?.conversationId || null);

  // Global conversation updates for the current user
  const { lastEvent: lastConversationEvent } = useConversationUpdates(user?.userId || null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  // Preselect conversation based on query parameters
  useEffect(() => {
    if (!user) return;
    if (!conversationIdParam && !startWithUserParam) return;

    const key =
      conversationIdParam != null
        ? `conv:${conversationIdParam}`
        : `user:${startWithUserParam}`;

    if (prefillHandledRef.current === key) {
      return;
    }

    const prepareConversation = async () => {
      try {
        if (conversationIdParam) {
          const existing = conversations.find(
            (conv) => conv.conversationId === conversationIdParam
          );

          if (existing) {
            setSelectedConversation(existing);
            router.replace(`/chat?conversationId=${existing.conversationId}`);
            return;
          }

          const { conversation } = await ChatAPI.getConversation(conversationIdParam);
          setConversations((prev) => {
            const hasConversation = prev.some(
              (conv) => conv.conversationId === conversation.conversationId
            );
            if (hasConversation) return prev;
            return [conversation, ...prev];
          });
          setSelectedConversation(conversation);
          router.replace(`/chat?conversationId=${conversation.conversationId}`);
          return;
        }

        if (startWithUserParam) {
          if (user.userId === startWithUserParam) {
            return;
          }

          const existing = conversations.find(
            (conv) => conv.otherUser.userId === startWithUserParam
          );

          if (existing) {
            setSelectedConversation(existing);
            router.replace(`/chat?conversationId=${existing.conversationId}`);
            return;
          }

          const { conversation } = await ChatAPI.createConversation(startWithUserParam, false);
          setConversations((prev) => {
            const hasConversation = prev.some(
              (conv) => conv.conversationId === conversation.conversationId
            );
            if (hasConversation) return prev;
            return [conversation, ...prev];
          });
          setSelectedConversation(conversation);
          router.replace(`/chat?conversationId=${conversation.conversationId}`);
        }
      } catch (error) {
        console.error('Failed to prepare chat conversation from query parameters:', error);
      } finally {
        prefillHandledRef.current = key;
      }
    };

    prepareConversation();
  }, [
    user,
    conversations,
    conversationIdParam,
    startWithUserParam,
    router,
  ]);

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

  // Apply conversation list updates from global WS events
  useEffect(() => {
    if (!lastConversationEvent) return;

    setConversations((prevConvs) => {
      const updated = prevConvs.map((conv) => {
        if (conv.conversationId === lastConversationEvent.conversationId) {
          const isActive = selectedConversation?.conversationId === conv.conversationId;
          const nextUnread = isActive ? 0 : (conv.unreadCount || 0) + 1;
          return {
            ...conv,
            lastActivity: lastConversationEvent.lastActivity,
            lastMessage: lastConversationEvent.lastMessage,
            unreadCount: nextUnread,
          } as Conversation;
        }
        return conv;
      });

      // Re-sort by lastActivity desc
      return updated.sort((a, b) =>
        new Date(b.lastActivity || 0).getTime() - new Date(a.lastActivity || 0).getTime()
      );
    });
  }, [lastConversationEvent, selectedConversation]);

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
        setMessages(chatMessages.reverse());
        setCurrentPage(0);
        setHasMoreMessages(chatMessages.length === 50);
        
        // Mark as read
        await ChatAPI.markMessagesAsRead(selectedConversation.conversationId);
        
        // Update conversation list to clear unread
        setConversations((prevConvs) =>
          prevConvs.map(conv =>
            conv.conversationId === selectedConversation.conversationId
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );

        // Scroll to bottom after loading
        setTimeout(() => scrollToBottom(), 100);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();
  }, [selectedConversation]);

  // Keep URL in sync with selected conversation
  useEffect(() => {
    if (!selectedConversation) return;
    if (conversationIdParam === selectedConversation.conversationId) return;

    router.replace(`/chat?conversationId=${selectedConversation.conversationId}`);
  }, [selectedConversation, conversationIdParam, router]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      const isCurrentConversation = selectedConversation?.conversationId === lastMessage.conversationId;
      const isOwnMessage = lastMessage.sender?.userId === user?.userId;
      
      if (isCurrentConversation) {
        setMessages((prev) => [...prev, lastMessage as any]);
        
        if (!isOwnMessage) {
          ChatAPI.markMessagesAsRead(lastMessage.conversationId);
        }

        // Auto-scroll to bottom if near bottom
        setTimeout(() => {
          const container = messagesContainerRef.current;
          if (container) {
            const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
            if (isNearBottom || isOwnMessage) {
              scrollToBottom();
            }
          }
        }, 100);
      }
      
      // Update conversation list
      updateConversationList(lastMessage, isCurrentConversation, isOwnMessage);
    }
  }, [lastMessage, selectedConversation, user]);

  // Handle read receipts
  useEffect(() => {
    if (lastReadReceipt) {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => ({
          ...msg,
          isRead: true,
          readAt: lastReadReceipt.readAt
        }))
      );
      
      setConversations((prevConvs) =>
        prevConvs.map(conv =>
          conv.conversationId === lastReadReceipt.conversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    }
  }, [lastReadReceipt]);

  const updateConversationList = (message: any, isCurrentConv: boolean, isOwnMsg: boolean) => {
    setConversations((prevConvs) => {
      const updatedConvs = prevConvs.map(conv => {
        if (conv.conversationId === message.conversationId) {
          const shouldIncrementUnread = !isOwnMsg && !isCurrentConv;
          
          let preview = '';
          if (message.messageType === 'IMAGE') {
            const urls = parseMediaUrls(message.mediaUrl);
            preview = urls.length > 1 ? `📷 ${urls.length} images` : '📷 Image';
          } else if (message.messageType === 'SYSTEM') {
            preview = 'Call activity';
          } else {
            preview = message.content?.substring(0, 50) + (message.content?.length > 50 ? '...' : '');
          }

          return {
            ...conv,
            lastActivity: message.sentAt,
            lastMessage: preview,
            totalMessageCount: conv.totalMessageCount + 1,
            unreadCount: shouldIncrementUnread ? (conv.unreadCount || 0) + 1 : (isCurrentConv ? 0 : conv.unreadCount)
          };
        }
        return conv;
      });
      
      // Re-sort by latest activity
      return updatedConvs.sort((a, b) => 
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      );
    });
  };

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  const loadOlderMessages = async () => {
    if (!selectedConversation || loadingOlderMessages || !hasMoreMessages) return;

    try {
      setLoadingOlderMessages(true);
      const nextPage = currentPage + 1;
      const { messages: olderMessages } = await ChatAPI.getChatHistory(
        selectedConversation.conversationId,
        nextPage,
        50
      );

      if (olderMessages.length === 0) {
        setHasMoreMessages(false);
        return;
      }

      // Save current scroll position
      const container = messagesContainerRef.current;
      const oldScrollHeight = container?.scrollHeight || 0;

      // Prepend older messages
      setMessages((prev) => [...olderMessages.reverse(), ...prev]);
      setCurrentPage(nextPage);
      setHasMoreMessages(olderMessages.length === 50);

      // Restore scroll position
      setTimeout(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - oldScrollHeight;
        }
      }, 0);
    } catch (error) {
      console.error('Failed to load older messages:', error);
    } finally {
      setLoadingOlderMessages(false);
    }
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container && container.scrollTop === 0) {
      loadOlderMessages();
    }
  };

  const parseMediaUrls = (mediaUrl: string | undefined): string[] => {
    if (!mediaUrl) return [];
    try {
      if (mediaUrl.startsWith('[')) {
        return JSON.parse(mediaUrl);
      }
      return [mediaUrl];
    } catch {
      return [mediaUrl];
    }
  };

  const canEditMessage = (sentAt: string): boolean => {
    const diff = Date.now() - new Date(sentAt).getTime();
    return diff < 2 * 60 * 1000; // 2 minutes
  };

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
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // Limit to 8 images
    const selected = files.slice(0, 8);
    setSelectedImages(selected);
    setShowImagePreview(true);
  };

  const handleSendImages = async () => {
    if (!selectedConversation || selectedImages.length === 0) return;

    try {
      setSending(true);
      setShowImagePreview(false);
      
      if (selectedImages.length === 1) {
        await ChatAPI.sendImageMessage(selectedConversation.conversationId, selectedImages[0]);
      } else {
        await ChatAPI.sendMultipleImages(selectedConversation.conversationId, selectedImages);
      }
      
      setSelectedImages([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to send images:', error);
      alert('Failed to send images. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Delete this message?')) return;

    try {
      await ChatAPI.deleteMessage(messageId);
      setMessages((prev) =>
        prev.map(msg =>
          msg.messageId === messageId ? { ...msg, isDeleted: true } : msg
        )
      );
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Failed to delete message');
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editContent.trim()) return;

    try {
      await ChatAPI.editMessage(messageId, editContent);
      setMessages((prev) =>
        prev.map(msg =>
          msg.messageId === messageId ? { ...msg, content: editContent, editedAt: new Date().toISOString() } : msg
        )
      );
      setEditingMessageId(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to edit message:', error);
      alert('Failed to edit message');
    }
  };

  const startEditing = (msg: ChatMessage) => {
    setEditingMessageId(msg.messageId);
    setEditContent(msg.content);
  };

  const openLightbox = (urls: string[], index: number) => {
    setLightboxImages(urls);
    setLightboxIndex(index);
    setShowLightbox(true);
  };

  // Group messages by date
  const groupedMessages: MessageGroup[] = [];
  let currentDate: string | null = null;
  
  messages.forEach((msg) => {
    const msgDate = new Date(msg.sentAt).toLocaleDateString();
    if (msgDate !== currentDate) {
      groupedMessages.push({ type: 'date', date: msgDate });
      currentDate = msgDate;
    }
    groupedMessages.push({ type: 'message', message: msg });
  });

  // Format call history messages
  const formatCallMessage = (msg: ChatMessage): string | null => {
    if (msg.messageType !== 'SYSTEM') return null;
    
    const content = msg.content.toLowerCase();
    const username = msg.sender?.username || 'User';
    const isOwnMessage = msg.sender?.userId === user?.userId;
    const you = isOwnMessage ? 'You' : username;
    
    if (content.includes('initiated a video call')) {
      return `${you} started a call`;
    }
    if (content.includes('joined the video call')) {
      return `${you} joined`;
    }
    if (content.includes('video call ended')) {
      const match = content.match(/duration:\s*(\d+:\d+)/i);
      if (match) {
        return `Call ended • ${match[1]}`;
      }
      return `Call ended`;
    }
    if (content.includes('declined the video call')) {
      return `${you} declined`;
    }
    
    return msg.content;
  };

  // Render image gallery based on count
  const renderImageGallery = (mediaUrl: string, messageId: string) => {
    const urls = parseMediaUrls(mediaUrl);
    if (urls.length === 0) return null;

    const gridClass = 
      urls.length === 1 ? 'grid-cols-1' :
      urls.length === 2 ? 'grid-cols-2' :
      urls.length <= 4 ? 'grid-cols-2' :
      'grid-cols-3';

    return (
      <div className={`grid ${gridClass} gap-1 rounded-lg overflow-hidden max-w-md`}>
        {urls.map((url, index) => (
          <button
            key={index}
            onClick={() => openLightbox(urls, index)}
            className="relative group cursor-pointer"
          >
            <img
              src={url}
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover aspect-square hover:opacity-90 transition-opacity"
            />
            {urls.length > 1 && index === urls.length - 1 && urls.length > 4 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xl font-bold">
                +{urls.length - 4}
              </div>
            )}
          </button>
        ))}
      </div>
    );
  };

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await searchUsers(searchQuery);
      
      let users = [];
      if (response.data?.content) {
        users = response.data.content;
      } else if (response.content) {
        users = response.content;
      } else if (Array.isArray(response)) {
        users = response;
      }
      
      const results = users.filter((u: any) => u.userId !== user?.userId);
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search users:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleCreateConversation = async (otherUserId: string) => {
    try {
      setCreatingConversation(true);
      const { conversation } = await ChatAPI.createConversation(otherUserId, false);
      
      setConversations((prev) => {
        const exists = prev.some(c => c.conversationId === conversation.conversationId);
        if (exists) return prev;
        return [conversation, ...prev];
      });
      
      setSelectedConversation(conversation);
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

  const handleCreateAdminConversation = async () => {
    try {
      setCreatingConversation(true);
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

  const handleStartVideoCall = async () => {
    if (!selectedConversation || !user) return;
    
    try {
      await startVideoCall(
        selectedConversation.conversationId,
        selectedConversation.otherUser.username || selectedConversation.otherUser.email
      );
    } catch (error) {
      console.error('Failed to start video call:', error);
      alert('Failed to start video call. Please try again.');
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <Leaf className="w-16 h-16 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">Loading sustainable conversations...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 bg-gradient-to-br from-primary/10 via-transparent to-primary-light/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
                <MessageCircle className="w-10 h-10 text-primary" />
                Green Loop Conversations
              </h1>
              <p className="text-muted-foreground mt-2">
                Connect with the sustainable fashion community
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSearchModal(true)}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-md"
              >
                <UserPlus className="w-5 h-5" />
                New Chat
              </button>
              <button
                onClick={handleCreateAdminConversation}
                disabled={creatingConversation}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-md"
              >
                <Headset className="w-5 h-5" />
                Contact Admin
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-350px)]">
          {/* Conversation List */}
          <div className="md:col-span-1 bg-card rounded-xl shadow-lg overflow-hidden border">
            <div className="p-4 bg-primary text-primary-foreground">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Conversations
              </h2>
              {isConnected && (
                <span className="text-xs opacity-90">● Connected</span>
              )}
            </div>
            <div className="overflow-y-auto h-[calc(100%-60px)]">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
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
                      className={`w-full p-4 text-left border-b hover:bg-accent/50 transition-colors ${
                        selectedConversation?.conversationId === conv.conversationId
                          ? 'bg-primary/5 border-l-4 border-primary'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {conv.isAdminConversation ? (
                          <Headset className="w-8 h-8 text-primary flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
                            {conv.otherUser.username[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-foreground truncate">
                              {conv.isAdminConversation ? 'Admin Support' : conv.otherUser.username}
                            </p>
                            {lastActivity && (
                              <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                                {lastActivity}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className={`text-sm truncate ${unreadCount > 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                              {unreadCount > 0 ? `${unreadCount} new message${unreadCount > 1 ? 's' : ''}` : (lastMessage || 'No messages yet')}
                            </p>
                            {unreadCount > 0 && (
                              <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full font-semibold whitespace-nowrap">
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
          <div className="md:col-span-2 bg-card rounded-xl shadow-lg overflow-hidden flex flex-col border">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between border-b">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {selectedConversation.isAdminConversation
                        ? 'Admin Support'
                        : selectedConversation.otherUser.username}
                    </h2>
                    <p className="text-sm opacity-90">
                      {selectedConversation.isAdminConversation
                        ? 'Get help with your sustainable fashion journey'
                        : selectedConversation.otherUser.email}
                    </p>
                  </div>
                  {!selectedConversation.isAdminConversation && selectedConversation.videoCallEnabled && (
                    <button
                      onClick={handleStartVideoCall}
                      className="px-4 py-2 bg-primary-foreground text-primary rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 font-semibold shadow-md"
                      title="Start Video Call"
                    >
                      <Video className="w-5 h-5" />
                      Video Call
                    </button>
                  )}
                </div>

                {/* Messages */}
                <div 
                  ref={messagesContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-br from-background to-muted/20"
                >
                  {loadingOlderMessages && (
                    <div className="text-center py-2">
                      <div className="inline-block animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  )}
                  
                  {groupedMessages.map((item, index) => {
                    if (item.type === 'date') {
                      return (
                        <div key={`date-${index}`} className="sticky top-0 z-10 flex justify-center my-4">
                          <div className="px-4 py-1 bg-muted rounded-full text-xs text-muted-foreground font-medium shadow-sm">
                            {item.date}
                          </div>
                        </div>
                      );
                    }

                    const msg = item.message!;
                    const isOwnMessage = msg.sender?.userId === user?.userId;
                    const isEditing = editingMessageId === msg.messageId;
                    const canEdit = isOwnMessage && canEditMessage(msg.sentAt) && msg.messageType === 'TEXT';
                    const callFormatted = formatCallMessage(msg);

                    // Render deleted message
                    if (msg.isDeleted) {
                      return (
                        <div key={msg.messageId} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className="max-w-[70%] rounded-lg p-3 bg-muted/50 border border-dashed">
                            <p className="text-sm italic text-muted-foreground">🗑️ Message deleted</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(msg.sentAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      );
                    }

                    // Render system/call message
                    if (msg.messageType === 'SYSTEM' && callFormatted) {
                      return (
                        <div key={msg.messageId} className="flex justify-center my-2">
                          <div className="px-3 py-1.5 bg-muted rounded-full text-xs text-muted-foreground flex items-center gap-2">
                            <Video className="w-3 h-3" />
                            {callFormatted}
                            <span className="opacity-60">
                              {new Date(msg.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.messageId}
                        className={`flex group ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="flex items-start gap-2 max-w-[70%]">
                          <div
                            className={`rounded-lg p-3 shadow-sm ${
                              isOwnMessage
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground'
                            }`}
                          >
                            {isEditing ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  onKeyPress={(e) => e.key === 'Enter' && handleEditMessage(msg.messageId)}
                                  className="w-full px-2 py-1 bg-background text-foreground rounded border"
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditMessage(msg.messageId)}
                                    className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingMessageId(null);
                                      setEditContent('');
                                    }}
                                    className="px-3 py-1 text-xs bg-muted text-foreground rounded"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {msg.messageType === 'IMAGE' && msg.mediaUrl && renderImageGallery(msg.mediaUrl, msg.messageId)}
                                {msg.messageType === 'TEXT' && (
                                  <p className="break-words">{msg.content}</p>
                                )}
                                <div className="flex items-center justify-between gap-2 mt-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs opacity-70">
                                      {new Date(msg.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                    {msg.editedAt && (
                                      <span className="text-xs opacity-60 italic">
                                        Edited
                                      </span>
                                    )}
                                  </div>
                                  {isOwnMessage && msg.messageType !== 'SYSTEM' && (
                                    <span className="text-xs opacity-70" title={msg.isRead ? "Read" : "Sent"}>
                                      {msg.isRead ? (
                                        <CheckCheck className="w-4 h-4 inline" />
                                      ) : (
                                        <Check className="w-4 h-4 inline" />
                                      )}
                                    </span>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                          
                          {/* Action buttons - always visible for own messages */}
                          {isOwnMessage && !isEditing && msg.messageType !== 'SYSTEM' && (
                            <div className="flex flex-col gap-1 mt-1">
                              {canEdit && (
                                <button
                                  onClick={() => startEditing(msg)}
                                  className="p-1.5 rounded-full bg-muted hover:bg-accent transition-colors"
                                  title="Edit message"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteMessage(msg.messageId)}
                                className="p-1.5 rounded-full bg-muted hover:bg-destructive/20 transition-colors text-destructive"
                                title="Delete message"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t bg-card">
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      max={8}
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="px-4 py-2 bg-muted hover:bg-accent rounded-lg cursor-pointer transition-colors flex items-center gap-2"
                      title="Send images (max 8)"
                    >
                      <ImageIcon className="w-5 h-5 text-primary" />
                    </label>
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    />
                    <button
                      type="submit"
                      disabled={sending || !messageInput.trim()}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-md"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Leaf className="w-24 h-24 mx-auto mb-4 opacity-20" />
                  <p className="text-xl">Select a conversation to start chatting</p>
                  <p className="text-sm mt-2">
                    Connect with the sustainable fashion community
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showImagePreview && selectedImages.length > 0 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Send {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''}</h3>
              <button onClick={() => {
                setShowImagePreview(false);
                setSelectedImages([]);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setSelectedImages(prev => prev.filter((_, i) => i !== index));
                      }}
                      className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowImagePreview(false);
                  setSelectedImages([]);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="px-6 py-2 bg-muted rounded-lg hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendImages}
                disabled={sending}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-primary" />
                Start New Conversation
              </h2>
              <button
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 border-b">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchUsers()}
                    placeholder="Search by email or username..."
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  />
                </div>
                <button
                  onClick={handleSearchUsers}
                  disabled={searching || !searchQuery.trim()}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Find users by their email address or username
              </p>
            </div>

            <div className="p-6 overflow-y-auto max-h-96">
              {searchResults.length === 0 && searchQuery && !searching && (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No users found matching "{searchQuery}"</p>
                  <p className="text-sm mt-2">Try searching by email or username</p>
                </div>
              )}

              {searchResults.length === 0 && !searchQuery && (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Search for users to start chatting</p>
                  <p className="text-sm mt-2">Enter an email or username above</p>
                </div>
              )}

              {searching && (
                <div className="text-center py-12">
                  <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Searching for users...</p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <button
                      key={result.userId}
                      onClick={() => handleCreateConversation(result.userId)}
                      disabled={creatingConversation}
                      className="w-full p-4 border rounded-lg hover:bg-accent transition-colors text-left flex items-center gap-4 disabled:opacity-50"
                    >
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xl font-bold">
                        {result.firstName[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">
                          {result.firstName} {result.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{result.username || result.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {result.email}
                        </p>
                      </div>
                      <MessageCircle className="w-6 h-6 text-primary" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {showLightbox && (
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setShowLightbox(false)}
        />
      )}

      <Footer />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <Header />
          <div className="flex items-center justify-center py-32">
            <div className="text-center text-muted-foreground">
              Loading chat experience...
            </div>
          </div>
          <Footer />
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}

