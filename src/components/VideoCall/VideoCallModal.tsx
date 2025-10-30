'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, X, Sparkles, Heart, VideoIcon } from 'lucide-react';
import azureCommunicationService from '@/services/azureCommunicationService';
import ChatAPI from '@/api/chat';

interface VideoCallModalProps {
  callData: {
    callSessionId: string;
    yourToken?: { userId: string; token: string; expiresOn: string };
    otherToken?: { userId: string; token: string; expiresOn: string };
    conversationId?: string;
  };
  onEndCall: (duration: number, actionType: string) => void;
}

const VideoCallModal: React.FC<VideoCallModalProps> = ({ callData, onEndCall }) => {
  const [callStatus, setCallStatus] = useState('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [cameraUnavailable, setCameraUnavailable] = useState(false);
  const [isLocalVideoRendered, setIsLocalVideoRendered] = useState(false);
  const [isRemoteVideoRendered, setIsRemoteVideoRendered] = useState(false);

  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRendererRef = useRef<any>(null);
  const localVideoRendererRef = useRef<any>(null);
  const localVideoStreamRef = useRef<any>(null);
  const callRef = useRef<any>(null);
  const durationTimerRef = useRef<any>(null);

  // Cleanup on mount (clear any stale resources)
  useEffect(() => {
    console.log('🎬 VideoCallModal mounted');
    // Clean up any stale resources from previous calls
    azureCommunicationService.cleanup().catch(e => {
      console.warn('Cleanup on mount error:', e);
    });
    
    return () => {
      console.log('🎬 VideoCallModal unmounting - running cleanup');
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (callData?.callSessionId && !isInitialized) {
      initializeCall();
    }
  }, [callData?.callSessionId, isInitialized]);

  const cleanup = () => {
    console.log('🧹 VideoCallModal: Starting cleanup...');
    
    // Stop call timer
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }

    // Clean up video renderers first
    cleanupVideoRenderers();

    // Stop and dispose local video stream
    if (localVideoStreamRef.current) {
      try {
        // Stop all tracks in the stream to turn off camera
        const mediaStream = localVideoStreamRef.current.mediaStream;
        if (mediaStream) {
          mediaStream.getTracks().forEach((track: any) => {
            track.stop();
            console.log('🎥 Stopped media track:', track.kind);
          });
        }
        localVideoStreamRef.current.dispose();
        console.log('✅ Local video stream disposed');
      } catch (e) {
        console.warn('Error disposing local video stream:', e);
      }
      localVideoStreamRef.current = null;
    }

    // Hang up call
    if (callRef.current) {
      try {
        callRef.current.hangUp();
        console.log('📞 Call hung up');
      } catch (e) {
        console.warn('Error hanging up call:', e);
      }
      callRef.current = null;
    }

    // Use service's cleanup method to dispose call agent and stop camera
    azureCommunicationService.cleanup().catch(e => {
      console.warn('Error in service cleanup:', e);
    });

    console.log('✅ VideoCallModal: Cleanup complete');
  };

  const cleanupVideoRenderers = () => {
    if (remoteVideoRendererRef.current) {
      try {
        remoteVideoRendererRef.current.dispose();
      } catch (e) {
        // Ignore disposal error
      }
      remoteVideoRendererRef.current = null;
    }

    if (localVideoRendererRef.current) {
      try {
        localVideoRendererRef.current.dispose();
      } catch (e) {
        // Ignore disposal error
      }
      localVideoRendererRef.current = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.innerHTML = '';
    }
    if (localVideoRef.current) {
      localVideoRef.current.innerHTML = '';
    }
  };

  const renderLocalVideo = async (stream: any) => {
    try {
      if (localVideoRendererRef.current) {
        try {
          localVideoRendererRef.current.dispose();
        } catch (e) {
          // Ignore disposal error
        }
        localVideoRendererRef.current = null;
      }

      if (!stream) {
        setIsLocalVideoRendered(false);
        return;
      }

      const { VideoStreamRenderer } = azureCommunicationService.getSDKClasses();
      if (!VideoStreamRenderer) {
        throw new Error('VideoStreamRenderer not available');
      }

      const renderer = new VideoStreamRenderer(stream);
      localVideoRendererRef.current = renderer;

      const view = await renderer.createView({
        scalingMode: 'Crop',
        isMirrored: true
      });

      if (localVideoRef.current) {
        localVideoRef.current.innerHTML = '';
        localVideoRef.current.appendChild(view.target);
        setIsLocalVideoRendered(true);
      }
    } catch (error) {
      console.error('Error rendering local video:', error);
      setIsLocalVideoRendered(false);
    }
  };

  const renderRemoteVideo = async (stream: any) => {
    try {
      if (remoteVideoRendererRef.current) {
        try {
          remoteVideoRendererRef.current.dispose();
        } catch (e) {
          // Ignore disposal error
        }
        remoteVideoRendererRef.current = null;
      }

      if (!stream || !stream.isAvailable) {
        setIsRemoteVideoRendered(false);
        return;
      }

      const { VideoStreamRenderer } = azureCommunicationService.getSDKClasses();
      if (!VideoStreamRenderer) {
        throw new Error('VideoStreamRenderer not available');
      }

      const renderer = new VideoStreamRenderer(stream);
      remoteVideoRendererRef.current = renderer;

      const view = await renderer.createView({
        scalingMode: 'Crop'
      });

      if (remoteVideoRef.current) {
        remoteVideoRef.current.innerHTML = '';
        remoteVideoRef.current.appendChild(view.target);
        setIsRemoteVideoRendered(true);
      }
    } catch (error) {
      console.error('Error rendering remote video:', error);
      setIsRemoteVideoRendered(false);
    }
  };

  const clearRemoteVideo = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.innerHTML = '';
    }
    
    if (remoteVideoRendererRef.current) {
      try {
        remoteVideoRendererRef.current.dispose();
      } catch (e) {
        // Ignore disposal error
      }
      remoteVideoRendererRef.current = null;
    }
    
    setIsRemoteVideoRendered(false);
  };

  const handleRemoteParticipant = (participant: any) => {
    participant.videoStreams.forEach((stream: any) => {
      if (stream.isAvailable) {
        renderRemoteVideo(stream);
      }

      stream.on('isAvailableChanged', () => {
        if (stream.isAvailable) {
          renderRemoteVideo(stream);
        } else {
          clearRemoteVideo();
        }
      });
    });
          
    participant.on('videoStreamsUpdated', (e: any) => {
      e.added.forEach((stream: any) => {
        if (stream.isAvailable) {
          renderRemoteVideo(stream);
        }

        stream.on('isAvailableChanged', () => {
          if (stream.isAvailable) {
            renderRemoteVideo(stream);
          } else {
            clearRemoteVideo();
          }
        });
      });

      e.removed.forEach(() => {
        clearRemoteVideo();
      });
    });
  };

  const setupCallEventListeners = (call: any) => {
    try {
      callRef.current = call;

      call.on('stateChanged', async () => {
        const newState = call.state;
        
        if (newState === 'Connected') {
          setCallStatus('connected');
          startCallTimer();
          
          if (isVideoEnabled && localVideoStreamRef.current) {
            try {
              await call.startVideo(localVideoStreamRef.current);
              await renderLocalVideo(localVideoStreamRef.current);
            } catch (error) {
              console.error('Error starting video:', error);
            }
          }
        } else if (newState === 'Disconnected' || newState === 'Ended') {
          setCallStatus('ended');
          stopCallTimer();
          cleanup();
          
          if (onEndCall && callStatus === 'connected') {
            onEndCall(callDuration, 'call_ended');
          }
        }
      });

      call.on('remoteParticipantsUpdated', (event: any) => {
        event.added.forEach(handleRemoteParticipant);
        event.removed.forEach(() => {
          clearRemoteVideo();
        });
      });

      if (call.remoteParticipants && call.remoteParticipants.length > 0) {
        call.remoteParticipants.forEach(handleRemoteParticipant);
      }

      if (call.state === 'Connected') {
        setCallStatus('connected');
        startCallTimer();
        
        if (isVideoEnabled && localVideoStreamRef.current) {
          try {
            call.startVideo(localVideoStreamRef.current);
            renderLocalVideo(localVideoStreamRef.current);
          } catch (error) {
            console.error('Error starting video:', error);
          }
        }
      }

    } catch (error) {
      console.error('Error setting up call event listeners:', error);
      setTimeout(() => {
        if (callStatus === 'connecting') {
          setCallStatus('connected');
          startCallTimer();
        }
      }, 5000);
    }
  };

  const createLocalVideoStream = async () => {
    try {
      if (!azureCommunicationService.deviceManager) {
        await azureCommunicationService.initialize();
      }

      const deviceManager = azureCommunicationService.deviceManager;
      await deviceManager.askDevicePermission({ audio: true, video: true });

      const cameras = await deviceManager.getCameras();
      if (!cameras || cameras.length === 0) {
        setCameraUnavailable(true);
        setIsVideoEnabled(false);
        return null;
      }

      const { LocalVideoStream } = azureCommunicationService.getSDKClasses();
      const localStream = new LocalVideoStream(cameras[0]);
      
      localVideoStreamRef.current = localStream;
      
      return localStream;
    } catch (error) {
      console.error('Error creating local video stream:', error);
      setCameraUnavailable(true);
      setIsVideoEnabled(false);
      return null;
    }
  };

  const initializeCall = async () => {
    try {
      setCallStatus('connecting');
      setError(null);

      console.log('🎥 Initializing video call with session:', callData.callSessionId);

      // Ensure Azure SDK is loaded
      const sdkAvailable = await azureCommunicationService.ensureSDKLoaded();
      if (!sdkAvailable) {
        throw new Error('Azure Communication Services SDK not available');
      }

      // Initialize Azure SDK and get call info in parallel (like movie-theater)
      // ALWAYS fetch fresh token via getCallJoinInfo (don't rely on callData.yourToken)
      const [callInfo] = await Promise.all([
        ChatAPI.getCallJoinInfo(callData.callSessionId),
        azureCommunicationService.initialize()
      ]);

      if (!callInfo.success || !callInfo.token) {
        throw new Error('Failed to get call information or token');
      }

      console.log('✅ Got call join info with token:', callInfo.userId);

      // Create call agent and local stream in parallel
      const [callAgent, localStream] = await Promise.all([
        azureCommunicationService.createCallAgent(callInfo.token),
        createLocalVideoStream()
      ]);
      
      // Render local video preview immediately
      if (localStream) {
        await renderLocalVideo(localStream);
      }

      // Join the call
      const call = await azureCommunicationService.joinCall(callData.callSessionId, localStream);
      callRef.current = call; // Store in ref, not state
      
      // Set up event listeners
      setupCallEventListeners(call);

      setIsInitialized(true);

      // Connection timeout fallback
      setTimeout(() => {
        if (callStatus === 'connecting') {
          setCallStatus('connected');
          startCallTimer();
        }
      }, 5000);

    } catch (error: any) {
      console.error('❌ Error initializing call:', error);
      setError(error.message || 'Failed to initialize call');
      setCallStatus('failed');
    }
  };

  const startCallTimer = () => {
    if (!durationTimerRef.current) {
      durationTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const stopCallTimer = () => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  };

  const toggleMute = async () => {
    try {
      if (!callRef.current) return;

      if (isMuted) {
        await callRef.current.unmute();
        setIsMuted(false);
      } else {
        await callRef.current.mute();
        setIsMuted(true);
      }
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const toggleVideo = async () => {
    try {
      if (!callRef.current || !localVideoStreamRef.current) return;

      if (isVideoEnabled) {
        try {
          await callRef.current.stopVideo(localVideoStreamRef.current);
          setIsVideoEnabled(false);
          setIsLocalVideoRendered(false);
          
          if (localVideoRef.current) {
            localVideoRef.current.innerHTML = '';
          }
        } catch (error) {
          console.error('Error stopping video:', error);
        }
      } else {
        let streamToStart = localVideoStreamRef.current;
        
        if (!streamToStart) {
          streamToStart = await createLocalVideoStream();
        }
        
        if (streamToStart) {
          try {
            await callRef.current.startVideo(streamToStart);
            await renderLocalVideo(streamToStart);
            setIsVideoEnabled(true);
          } catch (error) {
            console.error('Error starting video:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  };

  const endCall = async () => {
    try {
      console.log('📞 Ending call...');
      setCallStatus('ending');
      
      // Step 1: Hang up the Azure call FIRST (stops audio/video)
      if (callRef.current) {
        try {
          console.log('📞 Hanging up Azure call...');
          await callRef.current.hangUp();
          console.log('✅ Azure call hung up');
        } catch (azureError) {
          console.error('Error hanging up:', azureError);
        }
        callRef.current = null;
      }
      
      // Step 2: Clean up all resources (camera, streams, agents)
      console.log('🧹 Running cleanup...');
      cleanup();
      
      // Step 3: Stop timer
      stopCallTimer();
      setCallStatus('ended');
      
      // Step 4: Notify backend
      if (callData.callSessionId) {
        ChatAPI.endVideoCall(callData.callSessionId, 'Ended by user').catch(e => {
          console.warn('Error notifying backend of call end:', e);
        });
      }
      
      // Step 5: Notify parent component LAST (might unmount this component)
      if (onEndCall) {
        onEndCall(callDuration, 'manual_end');
      }
    } catch (error) {
      console.error('Error ending call:', error);
      // Force cleanup even on error
      if (callRef.current) {
        try {
          callRef.current.hangUp();
        } catch (e) {
          // Ignore
        }
      }
      cleanup();
      stopCallTimer();
      setCallStatus('ended');
      if (onEndCall) {
        onEndCall(callDuration, 'manual_end');
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Show loading state
  if (!isInitialized && !error && callData?.callSessionId) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 rounded-3xl p-8 max-w-md w-full mx-4 border border-white/20 shadow-2xl">
          <div className="text-center">
            <div className="relative mb-6">
              <Sparkles className="w-16 h-16 text-green-400 mx-auto animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Heart className="w-8 h-8 text-white animate-bounce" />
              </div>
            </div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
            <h3 className="text-2xl font-bold text-white mb-2">Connecting to Video Call</h3>
            <p className="text-gray-300 mb-4">Setting up your video call...</p>
            <div className="mt-4 text-sm text-gray-400 space-y-1">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Loading Azure SDK...</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span>Initializing camera...</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Joining call...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-gray-900 via-red-900 to-pink-900 rounded-3xl p-8 max-w-md w-full mx-4 border border-white/20 shadow-2xl">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h3 className="text-2xl font-bold text-white mb-2">Call Failed</h3>
            <p className="text-gray-300 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setError(null);
                  setIsInitialized(false);
                  cleanup();
                  initializeCall();
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full hover:from-green-600 hover:to-emerald-600 transition-all"
              >
                Retry
              </button>
              <button
                onClick={() => {
                  cleanup();
                  onEndCall && onEndCall(0, 'error');
                }}
                className="bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 rounded-3xl p-6 max-w-5xl w-full mx-4 max-h-[95vh] overflow-hidden border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-400 animate-pulse" />
              <h3 className="text-xl font-bold text-white">Video Call</h3>
              <Heart className="w-5 h-5 text-red-400 animate-pulse" />
            </div>
            <div className="bg-black/30 px-3 py-1 rounded-full border border-white/10">
              <span className="text-white font-mono text-sm">
                {formatDuration(callDuration)}
              </span>
            </div>
          </div>
          <button
            onClick={endCall}
            className="text-red-400 hover:text-red-300 transition-colors"
            disabled={callStatus === 'ending'}
          >
            <X size={24} />
          </button>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Local Video */}
          <div className="relative bg-black rounded-2xl overflow-hidden border border-white/20">
            <div
              ref={localVideoRef}
              className="w-full h-64 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden"
              style={{ minHeight: '256px' }}
            />
            
            {(cameraUnavailable || !isVideoEnabled || !isLocalVideoRendered) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/60 rounded-2xl">
                <VideoOff size={48} className="mb-2" />
                <span className="text-sm text-center">
                  {cameraUnavailable ? 'Camera unavailable' : !isVideoEnabled ? 'Camera is off' : 'Loading camera...'}
                </span>
              </div>
            )}
            
            <div className="absolute bottom-3 left-3 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              You {!isVideoEnabled && '(Video Off)'}
            </div>
            
            <div className="absolute top-3 right-3">
              <div className={`w-4 h-4 rounded-full ${isLocalVideoRendered && isVideoEnabled ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            </div>
          </div>
        
          {/* Remote Video */}
          <div className="relative bg-black rounded-2xl overflow-hidden border border-white/20">
            <div
              ref={remoteVideoRef}
              className="w-full h-64 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden"
              style={{ minHeight: '256px' }}
            />
            
            {!isRemoteVideoRendered && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/60 rounded-2xl">
                <VideoOff size={48} className="mb-2" />
                <span className="text-sm text-center">
                  {callStatus === 'connected' ? 'Waiting for video...' : 'Waiting for participant...'}
                </span>
              </div>
            )}
            
            <div className="absolute bottom-3 left-3 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              Receiver
            </div>

            <div className="absolute top-3 right-3">
              <div className={`w-4 h-4 rounded-full ${isRemoteVideoRendered ? 'bg-green-500' : 'bg-gray-500'} animate-pulse`} />
            </div>
          </div>
        </div>

        {/* Call Controls */}
        <div className="flex justify-center items-center gap-6">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all duration-300 shadow-lg hover:scale-110 ${
              isMuted 
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/25' 
                : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
            }`}
            disabled={callStatus !== 'connected'}
          >
            {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all duration-300 shadow-lg hover:scale-110 ${
              !isVideoEnabled 
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/25' 
                : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
            }`}
            disabled={callStatus !== 'connected' || cameraUnavailable}
          >
            {!isVideoEnabled ? <VideoOff size={28} /> : <VideoIcon size={28} />}
          </button>

          <button
            onClick={endCall}
            className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all duration-300 shadow-lg hover:scale-110 shadow-red-500/25"
            disabled={callStatus === 'ending'}
          >
            <PhoneOff size={28} />
          </button>
        </div>

        {/* Call Status */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-300">
            Status: {
              callStatus === 'connected' ? 'Connected' : 
              callStatus === 'connecting' ? 'Connecting...' : 
              callStatus === 'ending' ? 'Ending Call...' :
              callStatus === 'ended' ? 'Call Ended' : 
              callStatus === 'failed' ? 'Call Failed' : 
              callStatus
            }
          </p>
          
          {callStatus === 'connecting' && (
            <div className="mt-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400 mx-auto"></div>
              <p className="text-xs text-gray-400 mt-2">Waiting for other participant...</p>
            </div>
          )}
          
          {callStatus === 'connected' && (
            <div className="mt-2">
              <p className="text-xs text-green-400">Call in progress</p>
              {callDuration > 0 && (
                <p className="text-xs text-gray-400">Duration: {formatDuration(callDuration)}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;
