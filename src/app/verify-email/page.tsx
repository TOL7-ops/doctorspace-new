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
          <p className="text-center text-muted-foreground">
            We&apos;ve sent a verification link to{' '}
            <span className="font-medium text-foreground">{email}</span>
          </p>
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Please check your email and click the verification link to complete your registration.</p>
            <p className="text-sm text-muted-foreground">
              After verifying your email, you&apos;ll be able to sign in to your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 