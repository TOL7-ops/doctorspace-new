'use client';

import React from 'react';
import Link from 'next/link';

export default function TestResetPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-2">
      <div className="w-full max-w-md mx-auto bg-card rounded-2xl shadow-xl p-8 flex flex-col items-center border border-border">
        <h1 className="text-2xl font-bold mb-4 text-center text-foreground">Reset Password Test</h1>
        
        <div className="space-y-4 w-full">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h2 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Test Links:</h2>
            <div className="space-y-2">
              <Link 
                href="/reset-password" 
                className="block text-blue-600 dark:text-blue-400 hover:underline"
              >
                Reset Password (no token)
              </Link>
              <Link 
                href="/reset-password?access_token=test123" 
                className="block text-blue-600 dark:text-blue-400 hover:underline"
              >
                Reset Password (with test token)
              </Link>
              <Link 
                href="/forgot-password" 
                className="block text-blue-600 dark:text-blue-400 hover:underline"
              >
                Forgot Password
              </Link>
            </div>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h2 className="font-semibold text-green-800 dark:text-green-200 mb-2">Expected Behavior:</h2>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• Reset password page should load without redirecting</li>
              <li>• Should show form even without valid token</li>
              <li>• Should show error message for invalid/missing token</li>
              <li>• Should not redirect to login immediately</li>
            </ul>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h2 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Debug Steps:</h2>
            <ol className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>1. Open browser developer tools (F12)</li>
              <li>2. Go to Console tab</li>
              <li>3. Click the test links above</li>
              <li>4. Look for debug messages in console</li>
              <li>5. Check for any error messages</li>
            </ol>
          </div>

          <Link 
            href="/login" 
            className="block w-full text-center py-2 px-4 bg-primary text-primary-foreground rounded-lg font-semibold shadow hover:bg-primary/90 transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
} 