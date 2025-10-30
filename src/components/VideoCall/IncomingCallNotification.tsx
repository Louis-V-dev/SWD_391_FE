'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video, User } from 'lucide-react';

interface IncomingCallNotificationProps {
  callerName: string;
  callerAvatar?: string;
  callSessionId: string;
  onAccept: () => void;
  onDecline: () => void;
}

const IncomingCallNotification: React.FC<IncomingCallNotificationProps> = ({ 
  callerName, 
  callerAvatar,
  callSessionId, 
  onAccept, 
  onDecline 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    setIsAnimating(true);
    isMountedRef.current = true;

    // Call duration timer
    const durationTimer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      isMountedRef.current = false;
      clearInterval(durationTimer);
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-500/20 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-emerald-500/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/2 w-20 h-20 bg-teal-500/20 rounded-full animate-pulse"></div>
      </div>

      <div className={`relative bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl transform transition-all duration-500 ${
        isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Video className="w-6 h-6 text-green-400 animate-pulse" />
            <h2 className="text-2xl font-bold text-white">Incoming Video Call</h2>
          </div>
          <div className="flex items-center justify-center gap-2 text-green-300">
            <span className="text-sm font-medium">Green Loop Chat</span>
          </div>
        </div>

        {/* Caller Profile */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            {/* Animated Ring */}
            <div className="absolute inset-0 w-32 h-32 mx-auto">
              <div className="w-full h-full border-4 border-green-500/30 rounded-full animate-ping"></div>
              <div className="absolute inset-2 w-28 h-28 border-4 border-emerald-500/40 rounded-full animate-ping delay-100"></div>
            </div>
            
            {/* Profile Image */}
            <div className="relative w-32 h-32 mx-auto">
              {callerAvatar ? (
                <img
                  src={callerAvatar}
                  alt={callerName}
                  className="w-full h-full object-cover rounded-full border-4 border-white/20 shadow-lg"
                />
              ) : (
                <div className="w-full h-full rounded-full border-4 border-white/20 shadow-lg bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center">
                  <User className="w-16 h-16 text-white" />
                </div>
              )}
              
              {/* Online Status */}
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-400 border-3 border-white rounded-full shadow-lg animate-pulse"></div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">
            {callerName}
          </h3>
        </div>

        {/* Call Duration */}
        <div className="text-center mb-6">
          <div className="inline-block bg-black/30 px-4 py-2 rounded-full border border-white/10">
            <span className="text-white font-mono text-lg">
              {formatDuration(callDuration)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-8">
          {/* Decline Button */}
          <button
            onClick={onDecline}
            className="group relative p-6 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-red-500/25 hover:scale-110"
          >
            <PhoneOff size={32} />
            
            {/* Button Animation */}
            <div className="absolute inset-0 bg-red-400/30 rounded-full scale-0 group-hover:scale-150 transition-transform duration-300"></div>
            
            {/* Label */}
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-gray-300 whitespace-nowrap">
              Decline
            </span>
          </button>

          {/* Accept Button */}
          <button
            onClick={onAccept}
            className="group relative p-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-green-500/25 hover:scale-110"
          >
            <Phone size={32} />
            
            {/* Button Animation */}
            <div className="absolute inset-0 bg-green-400/30 rounded-full scale-0 group-hover:scale-150 transition-transform duration-300"></div>
            
            {/* Pulse Effect */}
            <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping"></div>
            
            {/* Label */}
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-gray-300 whitespace-nowrap">
              Accept
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallNotification;

