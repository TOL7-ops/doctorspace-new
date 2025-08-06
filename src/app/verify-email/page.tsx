'use client';

import { useSearchParams } from 'next/navigation';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a verification link to{' '}
            <span className="font-medium text-blue-600">{email}</span>
          </p>
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Please check your email and click the verification link to complete your registration.</p>
            <p className="mt-2">
              After verifying your email, you'll be able to sign in to your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 