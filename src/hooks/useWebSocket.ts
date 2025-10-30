/**
 * WebSocket hook for real-time chat messaging in Green Loop
 * Uses SockJS + STOMP for browser compatibility
 * 
 * NOTE: Install dependencies before using:
 * npm install sockjs-client @stomp/stompjs
 * npm install --save-dev @types/sockjs-client
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// Type-safe imports with fallback for missing dependencies
let Client: any;
let SockJS: any;

try {
  const stompModule = require('@stomp/stompjs');
  Client = stompModule.Client;
  SockJS = require('sockjs-client');
} catch (error) {
  console.warn('WebSocket dependencies not installed. Run: npm install sockjs-client @stomp/stompjs');
}

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/api/ws';

export interface WebSocketMessage {
  messageId: string;
  conversationId: string;
  content: string;
  messageType: string;
  sentAt: string;
  mediaUrl?: string;
  sender: {
    userId: string;
    username: string;
    email: string;
  };
}

export interface WebSocketReadReceipt {
  conversationId: string;
  readerId: string;
  readAt: string;
}

export interface WebSocketCallNotification {
  callId: string;
  type: string;
  callerName: string;
  callerUserId: string;
  callStatus: string;
  callSessionId: string;
  conversationId: string;
}

export interface ConversationActivityEvent {
  type: 'CONVERSATION_ACTIVITY';
  conversationId: string;
  lastMessage: string;
  lastActivity: string;
  senderId: string;
  messageType: string;
}

export function useWebSocket(conversationId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [lastReadReceipt, setLastReadReceipt] = useState<WebSocketReadReceipt | null>(null);
  const [lastCallNotification, setLastCallNotification] = useState<WebSocketCallNotification | null>(null);
  const clientRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!conversationId || !Client || !SockJS) {
      console.warn('[WebSocket] Dependencies not loaded');
      return;
    }

    // Clean up existing connection
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    try {
      const socketFactory = () => new SockJS(WEBSOCKET_URL);
      
      const stompClient = new Client({
        webSocketFactory: socketFactory,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (str: string) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[WebSocket Debug]', str);
          }
        },
        onConnect: () => {
          console.log('[WebSocket] Connected to conversation:', conversationId);
          setIsConnected(true);

          // Subscribe to conversation messages
          stompClient.subscribe(`/topic/conversation/${conversationId}`, (message: any) => {
            try {
              const data = JSON.parse(message.body);
              console.log('[WebSocket] Received message:', data);
              
              // Transform backend WebSocket format to match API response format
              const transformedMessage = {
                messageId: data.messageId,
                conversationId: data.conversationId,
                content: data.content,
                messageType: data.messageType,
                sentAt: data.sentAt,
                mediaUrl: data.mediaUrl,
                sender: {
                  userId: data.senderId,
                  username: data.senderUsername,
                  email: data.senderEmail,
                },
              };
              
              console.log('[WebSocket] Transformed message:', transformedMessage);
              setLastMessage(transformedMessage);
            } catch (error) {
              console.error('[WebSocket] Error parsing message:', error);
            }
          });

          // Subscribe to read receipts
          stompClient.subscribe(`/topic/conversation/${conversationId}/read-receipt`, (message: any) => {
            try {
              const data = JSON.parse(message.body);
              console.log('[WebSocket] Read receipt:', data);
              setLastReadReceipt({
                conversationId: conversationId,
                readerId: data.readerId,
                readAt: data.readAt
              });
            } catch (error) {
              console.error('[WebSocket] Error parsing read receipt:', error);
            }
          });

          // Subscribe to message edits
          stompClient.subscribe(`/topic/conversation/${conversationId}/edited`, (message: any) => {
            try {
              const data = JSON.parse(message.body);
              console.log('[WebSocket] Message edited:', data);
              // You can handle message edits here
            } catch (error) {
              console.error('[WebSocket] Error parsing edit notification:', error);
            }
          });

          // Subscribe to message deletions
          stompClient.subscribe(`/topic/conversation/${conversationId}/deleted`, (message: any) => {
            try {
              const data = JSON.parse(message.body);
              console.log('[WebSocket] Message deleted:', data);
              // You can handle message deletions here
            } catch (error) {
              console.error('[WebSocket] Error parsing delete notification:', error);
            }
          });

          // Subscribe to reactions
          stompClient.subscribe(`/topic/conversation/${conversationId}/reaction`, (message: any) => {
            try {
              const data = JSON.parse(message.body);
              console.log('[WebSocket] Reaction added:', data);
              // You can handle reactions here
            } catch (error) {
              console.error('[WebSocket] Error parsing reaction:', error);
            }
          });
        },
        onStompError: (frame: any) => {
          console.error('[WebSocket] STOMP error:', frame);
          setIsConnected(false);
        },
        onWebSocketError: (event: any) => {
          console.error('[WebSocket] WebSocket error:', event);
          setIsConnected(false);
        },
        onDisconnect: () => {
          console.log('[WebSocket] Disconnected');
          setIsConnected(false);
        },
      });

      stompClient.activate();
      clientRef.current = stompClient;
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      setIsConnected(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    // Delay connection slightly to prevent rapid reconnections
    reconnectTimeoutRef.current = setTimeout(connect, 100);

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [conversationId, connect]);

  const sendMessage = useCallback((message: any) => {
    if (clientRef.current && clientRef.current.connected && conversationId) {
      clientRef.current.publish({
        destination: `/app/chat/${conversationId}/send`,
        body: JSON.stringify(message),
      });
    } else {
      console.error('[WebSocket] Cannot send message - not connected');
    }
  }, [conversationId]);

  return {
    isConnected,
    lastMessage,
    lastReadReceipt,
    lastCallNotification,
    sendMessage,
  };
}

/**
 * Hook for receiving video call notifications
 * Subscribes to call notifications for the current user
 */
export function useVideoCallNotifications(userId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [incomingCall, setIncomingCall] = useState<WebSocketCallNotification | null>(null);
  const clientRef = useRef<any>(null);

  useEffect(() => {
    if (!userId || !Client || !SockJS) return;

    const socketFactory = () => new SockJS(WEBSOCKET_URL);
    
    const stompClient = new Client({
      webSocketFactory: socketFactory,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str: string) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Call Notification Debug]', str);
        }
      },
      onConnect: () => {
        console.log('[Call Notification] Connected for user:', userId);
        setIsConnected(true);

        // Subscribe to call notifications for this user
        stompClient.subscribe(`/topic/call/${userId}`, (message: any) => {
          try {
            const data = JSON.parse(message.body);
            console.log('[Call Notification] Received:', data);
            setIncomingCall(data);
          } catch (error) {
            console.error('[Call Notification] Error parsing:', error);
          }
        });
      },
      onStompError: (frame: any) => {
        console.error('[Call Notification] STOMP error:', frame);
        setIsConnected(false);
      },
      onDisconnect: () => {
        console.log('[Call Notification] Disconnected');
        setIsConnected(false);
      },
    });

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [userId]);

  const clearIncomingCall = useCallback(() => {
    setIncomingCall(null);
  }, []);

  return {
    isConnected,
    incomingCall,
    clearIncomingCall,
  };
}

/**
 * Hook for receiving conversation list updates for the current user
 */
export function useConversationUpdates(userId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<ConversationActivityEvent | null>(null);
  const clientRef = useRef<any>(null);

  useEffect(() => {
    if (!userId || !Client || !SockJS) return;

    const socketFactory = () => new SockJS(WEBSOCKET_URL);
    const stompClient = new Client({
      webSocketFactory: socketFactory,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str: string) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Conversation Updates Debug]', str);
        }
      },
      onConnect: () => {
        console.log('[Conversation Updates] Connected for user:', userId);
        setIsConnected(true);

        stompClient.subscribe(`/topic/user/${userId}/conversations`, (message: any) => {
          try {
            const data = JSON.parse(message.body);
            // Minimal validation
            if (data && data.type === 'CONVERSATION_ACTIVITY') {
              setLastEvent(data as ConversationActivityEvent);
              console.log('[Conversation Updates] Event:', data);
            }
          } catch (error) {
            console.error('[Conversation Updates] Error parsing:', error);
          }
        });
      },
      onStompError: (frame: any) => {
        console.error('[Conversation Updates] STOMP error:', frame);
        setIsConnected(false);
      },
      onDisconnect: () => {
        console.log('[Conversation Updates] Disconnected');
        setIsConnected(false);
      },
    });

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [userId]);

  return { isConnected, lastEvent };
}

