'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import ChatAPI from '@/api/chat';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { API_CONFIG } from '@/config/api.config';
import VideoCallModal from '@/components/VideoCall/VideoCallModal';
import IncomingCallNotification from '@/components/VideoCall/IncomingCallNotification';
import CallEndModal from '@/components/VideoCall/CallEndModal';
import WaitingForReceiverModal from '@/components/VideoCall/WaitingForReceiverModal';

const VideoCallContext = createContext<any>(null);
const WEBSOCKET_URL = API_CONFIG.WS_URL;
const CALL_TIMEOUT_MS = 30000;

const CALL_STATES = {
  IDLE: 'idle',
  OUTGOING_WAITING: 'outgoing_waiting',
  INCOMING_RINGING: 'incoming_ringing',
  ACCEPTING: 'accepting',
  CONNECTED: 'connected',
  ENDING: 'ending',
  ENDED: 'ended'
};

const ACTIONS = {
  SET_USER: 'SET_USER',
  SET_CONNECTION_STATUS: 'SET_CONNECTION_STATUS',
  START_OUTGOING_CALL: 'START_OUTGOING_CALL',
  RECEIVE_INCOMING_CALL: 'RECEIVE_INCOMING_CALL',
  ACCEPT_CALL: 'ACCEPT_CALL',
  DECLINE_CALL: 'DECLINE_CALL',
  CONNECT_CALL: 'CONNECT_CALL',
  END_CALL: 'END_CALL',
  CALL_TIMEOUT: 'CALL_TIMEOUT',
  SHOW_END_MODAL: 'SHOW_END_MODAL',
  HIDE_END_MODAL: 'HIDE_END_MODAL',
  CLEANUP: 'CLEANUP',
  ERROR: 'ERROR',
  FORCE_END_CALL: 'FORCE_END_CALL',
  UPDATE_CALL_DATA: 'UPDATE_CALL_DATA'
};

const initialState = {
  currentUser: null,
  isConnected: false,
  callState: CALL_STATES.IDLE,
  callSessionId: null,
  callData: null,
  callDuration: 0,
  showVideoCall: false,
  showIncomingCall: false,
  showWaitingModal: false,
  showCallEndModal: false,
  callEndReason: null,
  callEndedBy: null,
  error: null,
  processedSessions: new Set(),
  recentlyEndedSessions: new Set()
};

function callReducer(state: any, action: any) {
  switch (action.type) {
    case ACTIONS.SET_USER:
      return {
        ...state,
        currentUser: action.payload,
        error: null
      };

    case ACTIONS.SET_CONNECTION_STATUS:
      return {
        ...state,
        isConnected: action.payload
      };

    case ACTIONS.START_OUTGOING_CALL:
      return {
        ...state,
        callState: CALL_STATES.OUTGOING_WAITING,
        callSessionId: action.payload.callSessionId,
        callData: action.payload,
        showWaitingModal: true,
        showVideoCall: false,
        showIncomingCall: false,
        showCallEndModal: false,
        currentCallReceiver: action.payload.receiverName,
        callStatus: 'waiting',
        isAcceptingCall: false,
        error: null,
        processedSessions: new Set([...state.processedSessions, action.payload.callSessionId])
      };

    case ACTIONS.RECEIVE_INCOMING_CALL:
      console.log('🔔 Reducer: RECEIVE_INCOMING_CALL action triggered');
      console.log('🔔 Reducer: Current call state:', state.callState);
      console.log('🔔 Reducer: Payload:', action.payload);
      
      if (state.callState !== CALL_STATES.IDLE) {
        console.log('⚠️ Reducer: Cannot show incoming call - already in state:', state.callState);
        return state;
      }

      console.log('✅ Reducer: Setting showIncomingCall to TRUE');
      return {
        ...state,
        callState: CALL_STATES.INCOMING_RINGING,
        callSessionId: action.payload.callSessionId,
        callData: action.payload,
        showIncomingCall: true,
        showVideoCall: false,
        showWaitingModal: false,
        showCallEndModal: false,
        processedSessions: new Set([...state.processedSessions, action.payload.callSessionId]),
        error: null
      };

    case ACTIONS.ACCEPT_CALL:
      return {
        ...state,
        callState: CALL_STATES.ACCEPTING,
        showIncomingCall: false,
        showCallEndModal: false,
        callEndReason: null,
        callDuration: 0,
        isAcceptingCall: true,
        error: null
      };

    case ACTIONS.DECLINE_CALL:
      const declinedSessionId = state.callSessionId;
      return {
        ...state,
        callState: CALL_STATES.IDLE,
        callSessionId: null,
        callData: null,
        showIncomingCall: false,
        showWaitingModal: false,
        showVideoCall: false,
        processedSessions: declinedSessionId ? 
          new Set([...state.processedSessions, declinedSessionId]) : 
          state.processedSessions,
        error: null
      };

    case ACTIONS.CONNECT_CALL:
      return {
        ...state,
        callState: CALL_STATES.CONNECTED,
        showVideoCall: true,
        showIncomingCall: false,
        showWaitingModal: false,
        showCallEndModal: false,
        callEndReason: null,
        callDuration: 0,
        isAcceptingCall: false,
        error: null,
        processedSessions: new Set(),
        recentlyEndedSessions: new Set(),
        // Keep callData with tokens for VideoCallModal
        callData: state.callData
      };

    case ACTIONS.END_CALL:
      const sessionId = state.callSessionId;
      return {
        ...state,
        callState: CALL_STATES.ENDED,
        showVideoCall: false,
        showIncomingCall: false,
        showWaitingModal: false,
        callDuration: action.payload?.duration || 0,
        callEndReason: action.payload?.reason || 'call_ended',
        callEndedBy: action.payload?.endedBy || null,
        recentlyEndedSessions: sessionId ? 
          new Set([...state.recentlyEndedSessions, sessionId]) : 
          state.recentlyEndedSessions,
        error: null
      };

    case ACTIONS.CALL_TIMEOUT:
      if (state.callState === CALL_STATES.OUTGOING_WAITING) {
        return {
          ...state,
          callState: CALL_STATES.ENDED,
          showWaitingModal: false,
          showCallEndModal: false,
          callEndReason: 'receiver_no_answer',
          error: null
        };
      }
      return state;

    case ACTIONS.SHOW_END_MODAL:
      const isDeclineModal = action.payload?.reason === 'receiver_declined' || 
                             action.payload?.reason === 'receiver_no_answer';
      const isCallEndedModal = action.payload?.reason === 'call_ended';
      
      if (state.recentlyEndedSessions.has(action.payload?.callSessionId) && !isDeclineModal && !isCallEndedModal) {
        return {
          ...state,
          callState: CALL_STATES.IDLE,
          callSessionId: null,
          callData: null
        };
      }

      return {
        ...state,
        callState: CALL_STATES.ENDED,
        showVideoCall: false,
        showIncomingCall: false,
        showWaitingModal: false,
        showCallEndModal: true,
        callEndReason: action.payload?.reason || 'call_ended',
        callDuration: action.payload?.duration || 0,
        error: null
      };

    case ACTIONS.HIDE_END_MODAL:
      return {
        ...state,
        callState: CALL_STATES.IDLE,
        callSessionId: null,
        callData: null,
        showCallEndModal: false,
        callEndReason: null,
        callDuration: 0,
        callEndedBy: null,
        isAcceptingCall: false,
        error: null,
        processedSessions: new Set(),
        recentlyEndedSessions: new Set()
      };

    case ACTIONS.CLEANUP:
      return {
        ...initialState,
        currentUser: state.currentUser,
        isConnected: state.isConnected
      };

    case ACTIONS.ERROR:
      return {
        ...state,
        error: action.payload,
        callState: CALL_STATES.IDLE,
        showVideoCall: false,
        showIncomingCall: false,
        showWaitingModal: false
      };

    case ACTIONS.FORCE_END_CALL:
      const sessionIdToEnd = action.payload.callSessionId || state.callSessionId;
      return {
        ...state,
        callState: CALL_STATES.ENDED,
        showVideoCall: false,
        showIncomingCall: false,
        showWaitingModal: false,
        callDuration: action.payload?.duration || 0,
        callEndReason: action.payload?.reason || 'call_ended',
        callEndedBy: 'current_user',
        recentlyEndedSessions: sessionIdToEnd ? 
          new Set([...state.recentlyEndedSessions, sessionIdToEnd]) : 
          state.recentlyEndedSessions,
        error: null
      };

    case ACTIONS.UPDATE_CALL_DATA:
      return {
        ...state,
        callData: action.payload
      };

    default:
      return state;
  }
}

export const VideoCallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('🚀 VideoCallContext: Provider component mounted/rendered');
  
  const [state, dispatch] = useReducer(callReducer, initialState);
  const stompClientRef = useRef<any>(null);
  const isMountedRef = useRef(true);
  const timeoutRef = useRef<any>(null);
  const messageHandlerRef = useRef<any>(null);

  console.log('🚀 VideoCallContext: Current state:', state);

  // Load current user from cookies
  useEffect(() => {
    console.log('🔍 VideoCallContext: useEffect for loading user is RUNNING!');
    const loadCurrentUser = () => {
      try {
        console.log('🔍 VideoCallContext: Loading user from cookies...');
        console.log('🍪 All cookies:', document.cookie);
        
        // Read from the user_data cookie (same as useAuth.ts)
        const userDataStr = document.cookie.split('; ').find(row => row.startsWith('user_data='))?.split('=')[1];
        
        if (userDataStr) {
          try {
            const decodedStr = decodeURIComponent(userDataStr);
            const userData = JSON.parse(decodedStr);
            console.log('👤 VideoCallContext: Found user data:', userData);
            console.log('👤 VideoCallContext: userId:', userData.userId);
            console.log('👤 VideoCallContext: username:', userData.username);
            console.log('👤 VideoCallContext: email:', userData.email);
            
            if (userData.userId) {
              console.log('✅ VideoCallContext: Setting user from user_data cookie');
              dispatch({ 
                type: ACTIONS.SET_USER, 
                payload: { 
                  userId: userData.userId, 
                  username: userData.username || userData.email, 
                  email: userData.email 
                } 
              });
            } else {
              console.log('❌ VideoCallContext: No userId in user_data!');
            }
          } catch (parseError) {
            console.error('❌ VideoCallContext: Error parsing user_data:', parseError);
          }
        } else {
          console.log('❌ VideoCallContext: No user_data cookie found!');
        }
      } catch (error) {
        console.error('❌ VideoCallContext: Error loading user:', error);
      }
    };

    loadCurrentUser();
  }, []);

  // Connect to WebSocket for video call notifications
  useEffect(() => {
    console.log('🔌 VideoCallContext: Checking user...', state.currentUser);
    if (!state.currentUser?.userId) {
      console.log('⏳ VideoCallContext: No user yet, skipping WebSocket connection');
      return;
    }

    console.log('🔌 VideoCallContext: User found, connecting to video call WebSocket...', state.currentUser.userId);

    const connect = () => {
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1];
        console.log('🔑 VideoCallContext: Token found:', token ? '✅' : '❌');
        const socketFactory = () => new SockJS(`${WEBSOCKET_URL}?token=${token || ''}`);
        
        const stompClient = new Client({
          webSocketFactory: socketFactory,
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: () => {
            console.log('✅ VideoCallContext: WebSocket CONNECTED!');
            dispatch({ type: ACTIONS.SET_CONNECTION_STATUS, payload: true });
            
            // Subscribe to video call notifications
            console.log('📡 VideoCallContext: Subscribing to /topic/video-call/notifications');
            stompClient.subscribe(`/topic/video-call/notifications`, (message: any) => {
              try {
                const data = JSON.parse(message.body);
                console.log('📞 VideoCallContext: Received video call notification:', data);
                handleWebSocketMessage(data);
              } catch (error) {
                console.error('❌ VideoCallContext: Error parsing WebSocket message:', error);
              }
            });
            console.log('✅ VideoCallContext: Subscribed to video call notifications!');
          },
          onStompError: (frame: any) => {
            console.error('STOMP error:', frame);
            dispatch({ type: ACTIONS.SET_CONNECTION_STATUS, payload: false });
          },
          onWebSocketError: (event: any) => {
            console.error('WebSocket error:', event);
            dispatch({ type: ACTIONS.SET_CONNECTION_STATUS, payload: false });
          },
          onDisconnect: () => {
            console.log('❌ Video call WebSocket disconnected');
            dispatch({ type: ACTIONS.SET_CONNECTION_STATUS, payload: false });
          }
        });

        stompClient.activate();
        stompClientRef.current = stompClient;
        
        return () => {
          stompClient.deactivate();
          stompClientRef.current = null;
        };
      } catch (error) {
        console.error('WebSocket connection error:', error);
        dispatch({ type: ACTIONS.ERROR, payload: 'WebSocket connection failed' });
      }
    };

    const cleanup = connect();
    return cleanup;
  }, [state.currentUser?.userId]);

  // Define the message handler
  const handleWebSocketMessage = useCallback((message: any) => {
    console.log('📞 VideoCallContext: handleWebSocketMessage called with:', message);
    
    if (!isMountedRef.current) {
      console.log('⚠️ VideoCallContext: Component unmounted, ignoring message');
      return;
    }
    
    const currentUserId = state.currentUser?.userId;
    console.log('👤 VideoCallContext: Current user in handler:', currentUserId);
    
    if (!currentUserId) {
      console.log('⚠️ VideoCallContext: No current user, ignoring message');
      return;
    }

    console.log('📞 VideoCallContext: Handling message:', message.type);
    console.log('📞 VideoCallContext: Message data:', message);
    console.log('👤 VideoCallContext: Current user ID:', currentUserId);

    try {
      switch (message.type) {
        case 'INCOMING_CALL':
          console.log('📞 VideoCallContext: INCOMING_CALL received!');
          console.log('📞 VideoCallContext: Receiver ID from message:', message.receiverUserId);
          console.log('📞 VideoCallContext: Current user ID:', currentUserId);
          console.log('📞 VideoCallContext: Match?', message.receiverUserId === currentUserId);
          
          if (message.receiverUserId === currentUserId) {
            console.log('✅ VideoCallContext: This call is for me! Showing modal...');
            dispatch({
              type: ACTIONS.RECEIVE_INCOMING_CALL,
              payload: message
            });
          } else {
            console.log('❌ VideoCallContext: This call is not for me (receiverUserId mismatch)');
          }
          break;

        case 'CALL_ACCEPTED':
          const isAcceptedParticipant = message.callerUserId === currentUserId || 
                                       message.receiverUserId === currentUserId;
          
          if (isAcceptedParticipant) {
            // Clear the timeout when call is accepted
            if (timeoutRef.current) {
              console.log('⏰ Clearing call timeout - call was accepted!');
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            dispatch({ type: ACTIONS.CONNECT_CALL });
          }
          break;

        case 'CALL_DECLINED':
          const isDeclinedParticipant = message.callerUserId === currentUserId || 
                                       message.receiverUserId === currentUserId;
          
          if (isDeclinedParticipant) {
            const isCaller = message.callerUserId === currentUserId;
            
            dispatch({
              type: ACTIONS.FORCE_END_CALL,
              payload: {
                reason: 'receiver_declined',
                callSessionId: message.callSessionId
              }
            });
            
            if (isCaller) {
              setTimeout(() => {
                dispatch({
                  type: ACTIONS.SHOW_END_MODAL,
                  payload: {
                    reason: 'receiver_declined',
                    callSessionId: message.callSessionId
                  }
                });
              }, 500);
            }
          }
          break;

        case 'CALL_ENDED':
          const wasParticipant = message.callerUserId === currentUserId || 
                                message.receiverUserId === currentUserId;
          
          if (wasParticipant) {
            dispatch({
              type: ACTIONS.FORCE_END_CALL,
              payload: {
                reason: 'call_ended',
                duration: message.callDuration,
                callSessionId: message.callSessionId
              }
            });
            
            setTimeout(() => {
              dispatch({
                type: ACTIONS.SHOW_END_MODAL,
                payload: {
                  reason: 'call_ended',
                  duration: message.callDuration,
                  callSessionId: message.callSessionId
                }
              });
            }, 500);
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      dispatch({ type: ACTIONS.ERROR, payload: 'Error processing call message' });
    }
  }, [state.currentUser?.userId, state.callSessionId, state.callState]);

  const startVideoCall = useCallback(async (conversationId: string, receiverName: string = 'User') => {
    try {
      console.log('📞 Starting video call:', conversationId);
      
      // Auto-cleanup any active call before starting new one
      if (state.callState !== CALL_STATES.IDLE && state.callSessionId) {
        console.log('⚠️ Active call detected, cleaning up before starting new call...');
        // End the current call on backend
        await ChatAPI.endVideoCall(state.callSessionId, 'Starting new call').catch(e => {
          console.warn('Error ending previous call:', e);
        });
        // Clean up local resources
        dispatch({ type: ACTIONS.CLEANUP });
        // Wait for cleanup to complete
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const response = await ChatAPI.initiateVideoCall(conversationId);
      
      if (response.success) {
        const callSessionId = response.callSessionId; // Fixed: use callSessionId not callId
        
        dispatch({
          type: ACTIONS.START_OUTGOING_CALL,
          payload: {
            callSessionId,
            conversationId,
            receiverName,
            yourToken: response.yourToken,
            otherToken: response.otherToken
          }
        });
        
        // Set timeout for no answer
        timeoutRef.current = setTimeout(() => {
          dispatch({ type: ACTIONS.CALL_TIMEOUT });
          setTimeout(() => {
            dispatch({
              type: ACTIONS.SHOW_END_MODAL,
              payload: {
                reason: 'receiver_no_answer',
                callSessionId
              }
            });
          }, 500);
        }, CALL_TIMEOUT_MS);
      } else {
        throw new Error('Failed to start call');
      }
    } catch (error: any) {
      console.error('Error starting video call:', error);
      dispatch({ type: ACTIONS.ERROR, payload: error.message || 'Failed to start video call' });
    }
  }, []);

  const acceptCall = useCallback(async (callSessionId: string) => {
    try {
      if (state.callState !== CALL_STATES.INCOMING_RINGING) {
        // If there's an active call, end it first before accepting new one
        if (state.callState !== CALL_STATES.IDLE && state.callSessionId && state.callSessionId !== callSessionId) {
          console.log('⚠️ Active call detected, cleaning up before accepting new call...');
          // End the current call on backend
          await ChatAPI.endVideoCall(state.callSessionId, 'Accepting new call').catch(e => {
            console.warn('Error ending previous call:', e);
          });
          // Clean up local resources
          dispatch({ type: ACTIONS.CLEANUP });
          // Wait for cleanup to complete
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          throw new Error('Cannot accept call - invalid state');
        }
      }

      // Clear any timeouts
      if (timeoutRef.current) {
        console.log('⏰ Clearing timeout on accept');
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      dispatch({ type: ACTIONS.ACCEPT_CALL });
      
      // Accept call on backend and get token
      const response = await ChatAPI.acceptVideoCall(callSessionId);
      
      // Update callData with the receiver's token
      if (response.yourToken && state.callData) {
        const updatedCallData = {
          ...state.callData,
          yourToken: response.yourToken,
          callSessionId: response.callSessionId || state.callSessionId
        };
        
        // Update state with token
        dispatch({
          type: ACTIONS.UPDATE_CALL_DATA,
          payload: updatedCallData
        });
      }
      
      // Will transition to CONNECTED via WebSocket message
    } catch (error: any) {
      console.error('Error accepting call:', error);
      dispatch({ type: ACTIONS.ERROR, payload: error.message });
      throw error;
    }
  }, [state.callState, state.callData, state.callSessionId]);

  const declineCall = useCallback(async (callSessionId: string) => {
    try {
      await ChatAPI.declineVideoCall(callSessionId);
      dispatch({ type: ACTIONS.DECLINE_CALL });
    } catch (error: any) {
      console.error('Error declining call:', error);
      dispatch({ type: ACTIONS.ERROR, payload: error.message });
    }
  }, []);

  const endCall = useCallback(async (duration: number = 0, actionType: string = 'manual_end') => {
    try {
      if (!state.callSessionId) {
        return;
      }
      
      const sessionId = state.callSessionId;
      
      await ChatAPI.endVideoCall(sessionId);
      
      dispatch({
        type: ACTIONS.FORCE_END_CALL,
        payload: {
          reason: 'call_ended',
          duration,
          callSessionId: sessionId,
          actionType,
          endedBy: 'current_user'
        }
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
    } catch (error: any) {
      console.error('Error ending call:', error);
      dispatch({ type: ACTIONS.ERROR, payload: error.message });
    }
  }, [state.callSessionId]);

  const handleCallEndModalClose = useCallback(() => {
    dispatch({ type: ACTIONS.HIDE_END_MODAL });
  }, []);

  const handleWaitingClose = useCallback(async () => {
    try {
      await endCall(0, 'waiting_timeout');
      dispatch({ type: ACTIONS.FORCE_END_CALL, payload: { reason: 'caller_ended_waiting' } });
    } catch (error: any) {
      dispatch({ type: ACTIONS.ERROR, payload: error.message });
    }
  }, [endCall]);

  const handleVideoCallEnd = useCallback((duration: number = 0, actionType: string = 'manual_end') => {
    dispatch({
      type: ACTIONS.FORCE_END_CALL,
      payload: {
        reason: 'call_ended',
        duration,
        callSessionId: state.callSessionId,
        actionType
      }
    });
    
    if (state.callSessionId) {
      ChatAPI.endVideoCall(state.callSessionId).catch(error => {
        console.error('Error ending call on backend:', error);
      });
    }
  }, [state.callSessionId]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, []);

  const contextValue = {
    ...state,
    isCallActive: state.callState !== CALL_STATES.IDLE && state.callState !== CALL_STATES.ENDED,
    startVideoCall,
    acceptCall,
    declineCall,
    endCall,
    handleVideoCallEnd,
    handleCallEndModalClose,
    handleWaitingClose,
    cleanup: () => dispatch({ type: ACTIONS.CLEANUP })
  };

  console.log('🎨 VideoCallContext Render:', {
    showIncomingCall: state.showIncomingCall,
    callData: state.callData,
    callState: state.callState,
    callSessionId: state.callSessionId
  });

  return (
    <VideoCallContext.Provider value={contextValue}>
      {children}
      
      {state.showVideoCall && state.callSessionId && state.callData && (
        <VideoCallModal
          callData={state.callData}
          onEndCall={handleVideoCallEnd}
        />
      )}

      {state.showIncomingCall && state.callData && (
        <>
          {console.log('✅ Rendering IncomingCallNotification!')}
          <IncomingCallNotification
            callerName={state.callData.callerUsername || state.callData.callerName || 'User'}
            callerAvatar={state.callData.callerAvatar}
            callSessionId={state.callSessionId}
            onAccept={() => acceptCall(state.callSessionId)}
            onDecline={() => declineCall(state.callSessionId)}
          />
        </>
      )}

      <WaitingForReceiverModal
        isOpen={state.showWaitingModal}
        onClose={handleWaitingClose}
        receiverName={state.callData?.receiverName || 'User'}
        onTimeout={() => dispatch({ type: ACTIONS.CALL_TIMEOUT })}
      />

      <CallEndModal
        isOpen={state.showCallEndModal}
        onClose={handleCallEndModalClose}
        callEndReason={state.callEndReason}
        callDuration={state.callDuration}
      />

      {state.error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
          <p>Error: {state.error}</p>
          <button 
            onClick={() => dispatch({ type: ACTIONS.ERROR, payload: null })}
            className="ml-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </VideoCallContext.Provider>
  );
};

export const useVideoCall = () => {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error('useVideoCall must be used within a VideoCallProvider');
  }
  return context;
};

