'use client';

import React from 'react';
import { X, PhoneOff, Clock, UserX } from 'lucide-react';

interface CallEndModalProps {
  isOpen: boolean;
  onClose: () => void;
  callEndReason?: string;
  callDuration?: number;
}

const CallEndModal: React.FC<CallEndModalProps> = ({ 
  isOpen, 
  onClose, 
  callEndReason, 
  callDuration = 0 
}) => {
  if (!isOpen) return null;

  const getModalContent = () => {
    switch (callEndReason) {
      case 'receiver_declined':
        return {
          icon: <UserX className="w-16 h-16 text-red-400" />,
          title: 'Call Declined',
          message: 'The receiver declined your video call.',
          bgColor: 'from-red-900 via-red-800 to-red-900',
          iconColor: 'text-red-400'
        };
      case 'receiver_no_answer':
        return {
          icon: <Clock className="w-16 h-16 text-orange-400" />,
          title: 'No Answer',
          message: 'The receiver did not answer your call.',
          bgColor: 'from-orange-900 via-orange-800 to-orange-900',
          iconColor: 'text-orange-400'
        };
      case 'call_ended':
      default:
        return {
          icon: <PhoneOff className="w-16 h-16 text-gray-400" />,
          title: 'Call Ended',
          message: callDuration > 0 
            ? `Call ended after ${formatDuration(callDuration)}`
            : 'The call has ended.',
          bgColor: 'from-green-900 via-emerald-900 to-teal-900',
          iconColor: 'text-gray-400'
        };
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const content = getModalContent();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={`bg-gradient-to-br ${content.bgColor} rounded-3xl p-8 max-w-md w-full mx-4 border border-white/20 shadow-2xl`}>
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-white">Call Status</h2>
          </div>
        </div>

        {/* Icon and Content */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            {/* Animated background ring */}
            <div className="absolute inset-0 w-24 h-24 mx-auto">
              <div className="w-full h-full border-4 border-green-500/30 rounded-full animate-ping"></div>
              <div className="absolute inset-2 w-20 h-20 border-4 border-emerald-500/40 rounded-full animate-ping delay-100"></div>
            </div>
            
            {/* Icon */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              {content.icon}
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white mb-3">
            {content.title}
          </h3>
          
          <p className="text-gray-300 text-lg mb-4">
            {content.message}
          </p>

          {/* Duration display if available */}
          {callDuration > 0 && callEndReason === 'call_ended' && (
            <div className="bg-black/30 px-4 py-2 rounded-full border border-white/10 inline-block">
              <span className="text-white font-mono text-lg">
                Duration: {formatDuration(callDuration)}
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-full hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-green-500/25 hover:scale-105"
          >
            Close
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
};

export default CallEndModal;

