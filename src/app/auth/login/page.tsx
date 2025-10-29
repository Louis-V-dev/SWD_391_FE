'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, Recycle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { handleApiError, AuthAPI } from '@/api';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email or username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResendModal, setShowResendModal] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [lastResendTime, setLastResendTime] = useState<number>(0);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Debug: Track component lifecycle
  useEffect(() => {
    console.log('🎬 LoginPage: Component mounted');
    
    // Prevent any unhandled errors from causing page reload
    const handleError = (event: ErrorEvent) => {
      console.error('🚨 LoginPage: Unhandled error caught:', event.error);
      event.preventDefault();
      return false;
    };
    
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 LoginPage: Unhandled promise rejection:', event.reason);
      event.preventDefault();
      return false;
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    
    return () => {
      console.log('💀 LoginPage: Component unmounted');
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const onSubmit = async (data: LoginFormData, event?: React.BaseSyntheticEvent) => {
    // CRITICAL: Prevent default form submission
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Prevent duplicate submissions
    if (isLoading) {
      console.log('⚠️ LoginPage: Already submitting, ignoring');
      return;
    }

    console.log('📝 LoginPage: Form submitted');
    
    // Reset all states at the start
    setIsLoading(true);
    setError('');
    setShowResendModal(false);
    setResendSuccess('');
    
    try {
      console.log('🔄 LoginPage: Calling login function...');
      await login(data);
      
      console.log('✅ LoginPage: Login successful, navigating...');
      // Use router.push without window.location to prevent reload
      router.push('/');
      
    } catch (err: any) {
      console.error('❌ LoginPage: Login failed:', err);
      
      // Extract error message safely
      let errorMessage = 'Login failed. Please try again.';
      
      try {
        errorMessage = handleApiError(err);
      } catch (handleError) {
        console.error('❌ LoginPage: Error handling error:', handleError);
      }
      
      setError(errorMessage);
      
      // Check if error is about unverified email
      if (errorMessage.toLowerCase().includes('verify your email') || 
          errorMessage.toLowerCase().includes('email verification') ||
          errorMessage.toLowerCase().includes('not verified')) {
        // Backend can handle both email and username
        setResendEmail(data.emailOrUsername);
        setShowResendModal(true);
      }
      
      // Important: Don't let the error propagate further
      console.log('🛑 LoginPage: Error handled, NOT propagating');
      
    } finally {
      console.log('🏁 LoginPage: Request complete, stopping loading');
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    // Check cooldown
    const now = Date.now();
    const timeSinceLastResend = (now - lastResendTime) / 1000; // in seconds
    
    if (timeSinceLastResend < 60) {
      const remaining = Math.ceil(60 - timeSinceLastResend);
      setError(`Please wait ${remaining} seconds before resending.`);
      return;
    }
    
    // Validate input
    if (!resendEmail) {
      setError('Email or username is required.');
      return;
    }
    
    try {
      setResendLoading(true);
      setResendSuccess('');
      setError('');
      
      await AuthAPI.resendVerificationEmail(resendEmail);
      
      // Set cooldown
      setLastResendTime(now);
      setResendCooldown(60);
      
      setResendSuccess('Verification email sent! Please check your inbox.');
    } catch (err) {
      console.error('❌ LoginPage: Resend verification failed:', err);
      
      let errorMessage = 'Failed to resend verification email.';
      try {
        errorMessage = handleApiError(err);
      } catch (handleError) {
        console.error('❌ LoginPage: Error handling error:', handleError);
      }
      
      setError(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const closeModal = () => {
    setShowResendModal(false);
    setResendSuccess('');
    setError('');
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

        {/* Login Card */}
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
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary"
              >
                <Recycle className="h-6 w-6 text-primary-foreground" />
              </motion.div>
              
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription>
                Sign in to your Green Loop account to continue your sustainable fashion journey
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && !showResendModal && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
                >
                  {error}
                </motion.div>
              )}

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubmit(onSubmit)(e);
                }} 
                className="space-y-4" 
                noValidate
              >
                <Input
                  {...register('emailOrUsername')}
                  label="Email or Username"
                  placeholder="Enter your email or username"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.emailOrUsername?.message}
                  disabled={isLoading}
                  autoComplete="username"
                />

                <div className="space-y-2">
                  <Input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    placeholder="Enter your password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="hover:text-primary transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    }
                    error={errors.password?.message}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-sm cursor-pointer">
                    <input
                      id="remember-me"
                      name="rememberMe"
                      type="checkbox"
                      className="rounded border-border text-primary focus:ring-primary"
                      disabled={isLoading}
                    />
                    <span>Remember me</span>
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary hover:underline"
                    tabIndex={isLoading ? -1 : 0}
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  variant="gradient"
                  size="lg"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Login Button */}
              <GoogleLoginButton />

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link
                  href="/auth/register"
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <p>
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </motion.div>

        {/* Email Verification Modal */}
        {showResendModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeModal();
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="border-0 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-center">Email Verification Required</CardTitle>
                  <CardDescription className="text-center">
                    Your email address hasn't been verified yet. We've sent a verification link to your email.
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
                    >
                      {error}
                    </motion.div>
                  )}

                  {resendSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-md bg-green-50 p-3 text-sm text-green-800 border border-green-200"
                    >
                      {resendSuccess}
                    </motion.div>
                  ) : (
                    <>
                      <div className="rounded-md bg-yellow-50 p-3 border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                          Didn't receive the email? Click below to resend the verification link.
                        </p>
                        <p className="text-sm font-medium text-yellow-900 mt-2">
                          Verification email will be sent to the email address associated with: <span className="break-all">{resendEmail}</span>
                        </p>
                      </div>
                      
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleResendVerification();
                        }}
                        loading={resendLoading}
                        disabled={resendLoading || resendCooldown > 0}
                        className="w-full"
                        variant="gradient"
                      >
                        {resendLoading 
                          ? 'Sending...' 
                          : resendCooldown > 0 
                            ? `Wait ${resendCooldown}s to resend` 
                            : 'Resend Verification Email'}
                      </Button>
                    </>
                  )}
                  
                  <div className="text-center text-sm text-muted-foreground">
                    <p>After verifying, please try logging in again.</p>
                  </div>

                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      closeModal();
                    }}
                    variant="outline"
                    className="w-full"
                    disabled={resendLoading}
                  >
                    Close
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}