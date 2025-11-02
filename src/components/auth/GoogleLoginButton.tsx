'use client';

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { API_CONFIG } from '@/config/api.config';
import { useState } from 'react';
import Cookies from 'js-cookie';

export default function GoogleLoginButton() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.GOOGLE_LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const userData = data.data;

        // Manually store user data and token (bypass normal login flow)
        // Use the same cookie names as AuthContext expects
        const userDataToStore = {
          userId: userData.userId,
          email: userData.email,
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
        };
        
        // Set cookies with correct names (matching AuthContext)
        Cookies.set('auth_token', userData.accessToken, { expires: 7, path: '/' }); // 7 days
        Cookies.set('user_data', JSON.stringify(userDataToStore), { expires: 7, path: '/' }); // 7 days
        
        // Small delay to ensure cookies are set before redirect
        setTimeout(() => {
          window.location.href = userData.isProfileComplete 
            ? '/' // Redirect to home page
            : `/auth/complete-profile?userId=${userData.userId}`;
        }, 100);
        return;
      } else {
        setLoading(false);
        setError(data.message || 'Google login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setLoading(false);
      setError('An error occurred during Google login. Please try again.');
    }
  };

  const handleGoogleError = () => {
    setError('Google login was unsuccessful. Please try again.');
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Logging in...</span>
        </div>
      ) : (
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
            width="300"
          />
        </div>
      )}
    </div>
  );
}

