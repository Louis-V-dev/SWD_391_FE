'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Clock, Loader2 } from 'lucide-react';

interface WaitingForReceiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiverName?: string;
  onTimeout?: () => void;
}

const WaitingForReceiverModal: React.FC<WaitingForReceiverModalProps> = ({ 
  isOpen, 
  onClose, 
  receiverName = 'User', 
  onTimeout 
}) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setTimeLeft(30);
      isMountedRef.current = true;

      // Start countdown
      timeoutRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Auto timeout after 30 seconds
      const autoTimeout = setTimeout(() => {
        if (isMountedRef.current && onTimeout) {
          onTimeout();
        }
      }, 30000);

      return () => {
        clearTimeout(autoTimeout);
        if (timeoutRef.current) {
          clearInterval(timeoutRef.current);
        }
      };
    }
  }, [isOpen, onTimeout]);

  // Handle timeout when timeLeft reaches 0
  useEffect(() => {
    if (timeLeft === 0 && isMountedRef.current && onTimeout) {
      onTimeout();
    }
  }, [timeLeft, onTimeout]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((30 - timeLeft) / 30) * 100;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 rounded-3xl p-8 max-w-md w-full mx-4 border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-white">Waiting for Response</h2>
          </div>
        </div>

        {/* Main content */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            {/* Animated background rings */}
            <div className="absolute inset-0 w-32 h-32 mx-auto">
              <div className="w-full h-full border-4 border-green-500/30 rounded-full animate-ping"></div>
              <div className="absolute inset-2 w-28 h-28 border-4 border-emerald-500/40 rounded-full animate-ping delay-100"></div>
              <div className="absolute inset-4 w-24 h-24 border-4 border-teal-500/50 rounded-full animate-ping delay-200"></div>
            </div>
            
            {/* Phone icon with animation */}
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
              <div className="relative">
                <Phone className="w-16 h-16 text-green-400 animate-bounce" />
                <div className="absolute -top-2 -right-2">
                  <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white mb-3">
            Calling {receiverName}...
          </h3>
          
          <p className="text-gray-300 text-lg mb-6">
            Waiting for them to accept your video call
          </p>

          {/* Timer display */}
          <div className="bg-black/30 px-6 py-4 rounded-2xl border border-white/10 mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Clock className="w-6 h-6 text-orange-400" />
              <span className="text-white font-mono text-2xl font-bold">
                {formatTime(timeLeft)}
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            
            <p className="text-gray-400 text-sm">
              Auto-end in {timeLeft} seconds
            </p>
          </div>

          {/* Status indicators */}
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Call initiated</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span>Waiting...</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-full hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-red-500/25 hover:scale-105 flex items-center gap-2"
          >
            <PhoneOff size={20} />
            End Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitingForReceiverModal;

