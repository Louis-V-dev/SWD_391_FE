/**
 * Chat API Service for Green Loop
 * Handles all chat-related API calls including conversations, messages, and video calls
 */

import axiosInstance from '../lib/axios';

export interface Conversation {
  conversationId: string;
  conversationName: string;
  isActive: boolean;
  isAdminConversation: boolean;
  videoCallEnabled: boolean;
  totalMessageCount: number;
  lastActivity: string;
  createdAt: string;
  isBlocked: boolean;
  isBlockedByMe: boolean;
  unreadCount?: number;
  lastMessage?: string;
  otherUser: {
    userId: string;
    username: string;
    email: string;
  };
}

export interface ChatMessage {
  messageId: string;
  conversationId: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'SYSTEM' | 'CALL_STARTED' | 'CALL_ENDED' | 'CALL_MISSED';
  sentAt: string;
  isRead: boolean;
  readAt?: string;
  isDeleted: boolean;
  editedAt?: string;
  mediaUrl?: string;
  mediaType?: string;
  reactions?: string;
  replyToMessageId?: string;
  sender?: {
    userId: string;
    username: string;
    email: string;
  };
}

export interface VideoCall {
  callId: string;
  callSessionId: string;
  callStatus: 'INITIATED' | 'CONNECTING' | 'CONNECTED' | 'ACCEPTED' | 'DECLINED' | 'ENDED' | 'CANCELLED' | 'FAILED';
  startedAt: string;
  endedAt?: string;
  durationMinutes?: number;
  endReason?: string;
  isSuccessful: boolean;
  caller: {
    userId: string;
    username: string;
    email: string;
  };
  receiver: {
    userId: string;
    username: string;
    email: string;
  };
  conversationId: string;
}

class ChatAPI {
  // ==================== Conversation Management ====================

  /**
   * Create or get existing conversation with another user
   */
  async createConversation(otherUserId: string, isAdminConversation: boolean = false): Promise<{ conversation: Conversation }> {
    const response = await axiosInstance.post('/api/chat/conversations', {
      otherUserId,
      isAdminConversation,
    });
    return response.data;
  }

  /**
   * Get all conversations for the current user
   */
  async getUserConversations(): Promise<{ conversations: Conversation[] }> {
    const response = await axiosInstance.get('/api/chat/conversations');
    return response.data;
  }

  /**
   * Get admin conversations for the current user
   */
  async getAdminConversations(): Promise<{ conversations: Conversation[] }> {
    const response = await axiosInstance.get('/api/chat/conversations/admin');
    return response.data;
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId: string): Promise<{ conversation: Conversation }> {
    const response = await axiosInstance.get(`/api/chat/conversations/${conversationId}`);
    return response.data;
  }

  // ==================== Message Management ====================

  /**
   * Send a text message
   */
  async sendMessage(conversationId: string, content: string, messageType: string = 'TEXT'): Promise<{ message: ChatMessage }> {
    const response = await axiosInstance.post(
      `/api/chat/conversations/${conversationId}/messages`,
      { content, messageType }
    );
    return response.data;
  }

  /**
   * Send an image message
   */
  async sendImageMessage(conversationId: string, imageFile: File): Promise<{ message: ChatMessage }> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await axiosInstance.post(
      `/api/chat/conversations/${conversationId}/messages/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  /**
   * Send multiple images in one message (max 8)
   */
  async sendMultipleImages(conversationId: string, images: File[]): Promise<{ message: ChatMessage }> {
    if (images.length > 8) {
      throw new Error('Maximum 8 images allowed');
    }

    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await axiosInstance.post(
      `/api/chat/conversations/${conversationId}/messages/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  /**
   * Delete a message (soft delete)
   */
  async deleteMessage(messageId: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.delete(`/api/chat/messages/${messageId}`);
    return response.data;
  }

  /**
   * Edit a message
   */
  async editMessage(messageId: string, content: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.put(`/api/chat/messages/${messageId}`, { content });
    return response.data;
  }

  /**
   * Get chat history with pagination
   */
  async getChatHistory(conversationId: string, page: number = 0, size: number = 50): Promise<{ messages: ChatMessage[]; page: number; size: number }> {
    const response = await axiosInstance.get(
      `/api/chat/conversations/${conversationId}/messages`,
      { params: { page, size } }
    );
    return response.data;
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(conversationId: string): Promise<{ message: string }> {
    const response = await axiosInstance.post(`/api/chat/conversations/${conversationId}/read`);
    return response.data;
  }

  /**
   * Get unread message count
   */
  async getUnreadMessageCount(conversationId: string): Promise<{ unreadCount: number }> {
    const response = await axiosInstance.get(`/api/chat/conversations/${conversationId}/unread-count`);
    return response.data;
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<{ message: string }> {
    const response = await axiosInstance.delete(`/api/chat/messages/${messageId}`);
    return response.data;
  }

  /**
   * Edit a message
   */
  async editMessage(messageId: string, content: string): Promise<{ message: string }> {
    const response = await axiosInstance.put(`/api/chat/messages/${messageId}`, { content });
    return response.data;
  }

  /**
   * Add reaction to a message
   */
  async addReaction(messageId: string, emoji: string): Promise<{ message: string }> {
    const response = await axiosInstance.post(`/api/chat/messages/${messageId}/reactions`, { emoji });
    return response.data;
  }

  // ==================== Block/Unblock ====================

  /**
   * Block a user in a conversation
   */
  async blockUser(conversationId: string): Promise<{ message: string }> {
    const response = await axiosInstance.post(`/api/chat/conversations/${conversationId}/block`);
    return response.data;
  }

  /**
   * Unblock a user in a conversation
   */
  async unblockUser(conversationId: string): Promise<{ message: string }> {
    const response = await axiosInstance.post(`/api/chat/conversations/${conversationId}/unblock`);
    return response.data;
  }

  // ==================== Azure Communication Services ====================

  /**
   * Get Azure Communication Services status
   */
  async getACSStatus(): Promise<{ status: any }> {
    const response = await axiosInstance.get('/api/azure-communication/status');
    return response.data;
  }

  /**
   * Create a new ACS user and token
   */
  async createUserAndToken(): Promise<{ userId: string; token: string; expiresOn: string }> {
    const response = await axiosInstance.post('/api/azure-communication/users');
    return response.data;
  }

  /**
   * Refresh token for an existing user
   */
  async refreshUserToken(userId: string): Promise<{ userId: string; token: string; expiresOn: string }> {
    const response = await axiosInstance.post(`/api/azure-communication/users/${userId}/token`);
    return response.data;
  }

  // ==================== Video Call Management ====================

  /**
   * Initiate a video call
   */
  async initiateVideoCall(conversationId: string): Promise<{
    success: boolean;
    callId: string;
    callSessionId: string;
    callStatus: string;
    yourToken: { userId: string; token: string; expiresOn: string };
    otherToken: { userId: string; token: string; expiresOn: string };
  }> {
    const response = await axiosInstance.post('/api/azure-communication/calls/initiate', {
      conversationId,
    });
    return response.data;
  }

  /**
   * Accept a video call
   */
  async acceptVideoCall(callId: string): Promise<{
    success: boolean;
    message: string;
    yourToken?: { userId: string; token: string; expiresOn: string };
    callSessionId?: string;
  }> {
    const response = await axiosInstance.post(`/api/azure-communication/calls/${callId}/answer`); // Fixed: Changed /accept to /answer
    return response.data;
  }

  /**
   * Answer a video call (alias for accept)
   */
  async answerVideoCall(callId: string): Promise<{ message: string }> {
    return this.acceptVideoCall(callId);
  }

  /**
   * Decline a video call
   */
  async declineVideoCall(callId: string, reason?: string): Promise<{ message: string }> {
    const response = await axiosInstance.post(`/api/azure-communication/calls/${callId}/decline`, {
      reason: reason || 'User declined',
    });
    return response.data;
  }

  /**
   * End a video call
   */
  async endVideoCall(callId: string, reason?: string): Promise<{ message: string }> {
    const response = await axiosInstance.post(`/api/azure-communication/calls/${callId}/end`, {
      reason: reason || 'User ended call',
    });
    return response.data;
  }

  /**
   * Get call history for a conversation
   */
  async getCallHistory(conversationId: string): Promise<{ calls: VideoCall[] }> {
    const response = await axiosInstance.get(`/api/azure-communication/calls/conversation/${conversationId}`);
    return response.data;
  }

  /**
   * Get call join info (token and session details)
   */
  async getCallJoinInfo(callSessionId: string): Promise<{
    success: boolean;
    token: string;
    callSessionId: string;
    userId?: string;
    expiresOn?: string;
  }> {
    const response = await axiosInstance.get(`/api/azure-communication/calls/${callSessionId}/join-info`);
    return response.data;
  }
}

export default new ChatAPI();

