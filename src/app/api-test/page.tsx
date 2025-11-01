'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function ApiTestPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const testApiConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing API connection...');
    
    try {
      // Test with a simple login request
      const testCredentials = {
        usernameOrEmail: 'test@example.com',
        password: 'testpassword'
      };
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCredentials)
      });
      
      if (response.ok) {
        setTestResult(' API connection successful! Backend is running.');
      } else {
        setTestResult(`❌ API returned status: ${response.status}`);
      }
    } catch (error: any) {
      if (error.message.includes('Failed to fetch') || error.message.includes('Network Error')) {
        setTestResult(' Backend server is not running. Please start the Spring Boot server.');
      } else {
        setTestResult(`❌ API Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const testHealthEndpoint = async () => {
    setIsLoading(true);
    setTestResult('Testing health endpoint...');
    
    try {
      const response = await fetch(`${API_URL}/actuator/health`);
      if (response.ok) {
        const data = await response.json();
        setTestResult(`✅ Health endpoint working! Status: ${data.status}`);
      } else {
        setTestResult(`❌ Health endpoint returned: ${response.status}`);
      }
    } catch (error: any) {
      setTestResult(`❌ Health endpoint error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>API Connection Test</CardTitle>
              <CardDescription>
                Test the connection between frontend and backend
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button
                  onClick={testHealthEndpoint}
                  variant="outline"
                  className="w-full"
                  loading={isLoading}
                >
                  Test Health Endpoint
                </Button>
                
                <Button
                  onClick={testApiConnection}
                  variant="gradient"
                  className="w-full"
                  loading={isLoading}
                >
                  Test Login API
                </Button>
              </div>
              
              {testResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-md bg-muted text-sm"
                >
                  {testResult}
                </motion.div>
              )}
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Backend URL:</strong> {API_URL}</p>
                <p><strong>Health Endpoint:</strong> /actuator/health</p>
                <p><strong>Login Endpoint:</strong> /api/auth/login</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
