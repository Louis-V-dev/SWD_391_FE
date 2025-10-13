'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AuthAPI } from '@/api';

interface UnverifiedEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export function UnverifiedEmailModal({ isOpen, onClose, email }: UnverifiedEmailModalProps) {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');

  const handleResendEmail = async () => {
    try {
      setIsResending(true);
      setMessage('');
      const result = await AuthAPI.resendVerificationEmail(email);
      setMessage(result);
      setMessageType('success');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to resend email');
      setMessageType('error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-full p-4">
                  <AlertCircle className="h-12 w-12 text-yellow-600 dark:text-yellow-500" />
                </div>
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Email Not Verified
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Your email address <strong className="text-gray-900 dark:text-white">{email}</strong> hasn't been verified yet.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Please check your inbox for the verification email we sent you. If you didn't receive it, you can request a new one.
                </p>
              </div>

              {/* Message */}
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 p-3 rounded-lg text-sm ${
                    messageType === 'success'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {message}
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleResendEmail}
                  disabled={isResending}
                  variant="gradient"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Resend Email
                    </>
                  )}
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
              </div>

              {/* Help text */}
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                💡 Tip: Check your spam folder if you can't find the email
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
} 
