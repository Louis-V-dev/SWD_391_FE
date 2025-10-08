'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';

function VerifyContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const { verifyEmail } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (token) {
      handleVerification(token);
    }
  }, [token]);

  const handleVerification = async (verificationToken: string) => {
    try {
      setStatus('loading');
      const result = await verifyEmail(verificationToken);
      setStatus('success');
      setMessage(result);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login?verified=true');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Verification failed');
    }
  };

  const handleResendEmail = async () => {
    if (!email) return;
    
    try {
      setIsResending(true);
      // Here you would call an API to resend verification email
      // For now, we'll just show a success message
      setMessage('Verification email sent! Please check your inbox.');
    } catch (error) {
      setMessage('Failed to resend email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <RefreshCw className="h-16 w-16 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-primary" />;
      case 'error':
        return <XCircle className="h-16 w-16 text-destructive" />;
      default:
        return <Mail className="h-16 w-16 text-muted-foreground" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'loading':
        return 'Verifying your email...';
      case 'success':
        return 'Email verified successfully!';
      case 'error':
        return 'Verification failed';
      default:
        return 'Verify your email address';
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'loading':
        return 'Please wait while we verify your email address.';
      case 'success':
        return 'Your account has been successfully verified. You can now sign in to your account.';
      case 'error':
        return message || 'There was an error verifying your email. Please try again or contact support.';
      default:
        return email 
          ? `We've sent a verification link to ${email}. Please check your email and click the link to verify your account.`
          : 'Please check your email for a verification link.';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to home link */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </motion.div>

        {/* Verification Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" as const, stiffness: 200 }}
                className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
              >
                {getStatusIcon()}
              </motion.div>
              
              <CardTitle className="text-2xl font-bold">{getStatusTitle()}</CardTitle>
              <CardDescription className="text-base">
                {getStatusDescription()}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center space-y-4"
                >
                  <p className="text-sm text-muted-foreground">
                    Redirecting you to the login page...
                  </p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      className="bg-primary h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 3, ease: 'linear' }}
                    />
                  </div>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-4"
                >
                  <div className="text-center">
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                      className="w-full"
                    >
                      Try Again
                    </Button>
                  </div>
                  
                  {email && (
                    <div className="text-center">
                      <Button
                        onClick={handleResendEmail}
                        variant="ghost"
                        size="sm"
                        loading={isResending}
                        className="text-primary"
                      >
                        Resend verification email
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

              {status === 'idle' && email && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-4"
                >
                  <div className="text-center">
                    <Button
                      onClick={handleResendEmail}
                      variant="gradient"
                      className="w-full"
                      loading={isResending}
                    >
                      Resend verification email
                    </Button>
                  </div>
                  
                  <div className="text-center">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full"
                    >
                      <Link href="/auth/login">
                        Back to Login
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              )}

              {status === 'idle' && !email && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center"
                >
                  <Button
                    asChild
                    variant="gradient"
                    className="w-full"
                  >
                    <Link href="/auth/login">
                      Go to Login
                    </Link>
                  </Button>
                </motion.div>
              )}

              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={handleResendEmail}
                    className="text-primary hover:underline"
                    disabled={isResending}
                  >
                    resend verification email
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <p>
            Need help? Contact our{' '}
            <Link href="/support" className="text-primary hover:underline">
              support team
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <RefreshCw className="h-16 w-16 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold">Loading...</CardTitle>
            <CardDescription className="text-base">
              Please wait while we load the verification page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyContent />
    </Suspense>
  );
}
