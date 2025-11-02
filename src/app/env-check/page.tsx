'use client';

/**
 * Environment Variables Diagnostic Page
 * This page shows what environment variables are ACTUALLY in the built bundle
 * Access at: /env-check
 */

import { useEffect, useState } from 'react';
import { API_CONFIG } from '@/config/api.config';

export default function EnvCheckPage() {
  const [clientEnv, setClientEnv] = useState<Record<string, string>>({});
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    // Get all NEXT_PUBLIC_ variables from the client
    const env: Record<string, string> = {};
    
    // These are the ones we care about
    const keys = [
      'NEXT_PUBLIC_API_URL',
      'NEXT_PUBLIC_WS_URL',
      'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
      'NEXT_PUBLIC_CLOUDINARY_API_KEY',
      'NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET',
      'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
      'NODE_ENV'
    ];

    keys.forEach(key => {
      // @ts-ignore - accessing process.env dynamically
      env[key] = process.env[key] || 'NOT SET';
    });

    setClientEnv(env);
    setIsProduction(process.env.NODE_ENV === 'production');
  }, []);

  const hasLocalhostIssue = 
    clientEnv.NEXT_PUBLIC_API_URL?.includes('localhost') ||
    clientEnv.NEXT_PUBLIC_API_URL?.includes('127.0.0.1') ||
    clientEnv.NEXT_PUBLIC_API_URL?.includes(':8080');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            🔍 Environment Variables Diagnostic
          </h1>

          {/* Status Banner */}
          <div className={`p-4 rounded-lg mb-6 ${
            hasLocalhostIssue && isProduction
              ? 'bg-red-100 border border-red-400'
              : 'bg-green-100 border border-green-400'
          }`}>
            <p className={`font-bold ${
              hasLocalhostIssue && isProduction ? 'text-red-700' : 'text-green-700'
            }`}>
              {hasLocalhostIssue && isProduction
                ? '❌ CRITICAL ISSUE DETECTED'
                : '✅ Configuration looks good'}
            </p>
          </div>

          {/* API Config (from our centralized config) */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              📡 API Configuration (from API_CONFIG)
            </h2>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded font-mono text-sm">
              <div className="mb-2">
                <span className="text-gray-600 dark:text-gray-400">BASE_URL:</span>
                <span className="ml-2 text-gray-900 dark:text-white font-bold">
                  {API_CONFIG.BASE_URL}
                </span>
              </div>
              <div className="mb-2">
                <span className="text-gray-600 dark:text-gray-400">WS_URL:</span>
                <span className="ml-2 text-gray-900 dark:text-white font-bold">
                  {API_CONFIG.WS_URL}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">IS_PRODUCTION:</span>
                <span className="ml-2 text-gray-900 dark:text-white font-bold">
                  {API_CONFIG.IS_PRODUCTION ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Raw Environment Variables */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              🔧 Raw Environment Variables (Baked into Bundle)
            </h2>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded font-mono text-sm space-y-2">
              {Object.entries(clientEnv).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                  <span className={`ml-4 font-bold ${
                    value.includes('localhost') || value.includes('8080')
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostic Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              🔬 Diagnostic Information
            </h2>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded space-y-2 text-sm">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Current Time:</strong> {new Date().toISOString()}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Window Location:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}
              </p>
            </div>
          </div>

          {/* Issue Detection */}
          {hasLocalhostIssue && isProduction && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Production Build Issue Detected
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>The API URL contains localhost/8080 in a production build!</p>
                    <p className="mt-2 font-bold">This means:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>The build was created WITHOUT proper environment variables</li>
                      <li>The JavaScript bundle has localhost hardcoded into it</li>
                      <li>You need to rebuild the application with correct env vars</li>
                    </ul>
                    <p className="mt-3 font-bold">To fix:</p>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      <li>Verify GitHub Secrets are set correctly</li>
                      <li>Delete the .next folder locally</li>
                      <li>Trigger a new GitHub Actions deployment</li>
                      <li>Clear browser cache after deployment</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> These values are BAKED INTO the JavaScript bundle at build time.
                  Changing Azure Web App environment variables AFTER deployment won&apos;t affect these values.
                  You must rebuild the application for changes to take effect.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


