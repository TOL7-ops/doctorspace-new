'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { createUserProfile } from '@/lib/auth-client';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);

  const isNextEnabled = name && email && month && day && year;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dateOfBirth = `${year}-${String(months.indexOf(month) + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Generate a secure password
      const password = Math.random().toString(36).slice(-10) + 'A!';
      

      
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone_number: 'Not provided', // Default since we're not collecting phone
            date_of_birth: dateOfBirth,
          },
        },
      });

      if (result.error) {
        console.error('Signup error details:', {
          message: result.error.message,
          status: result.error.status,
          name: result.error.name,
          details: result.error
        });
        
        // Provide more specific error messages
        let errorMessage = 'Signup failed. Please try again.';
        if (result.error.message.includes('Database error')) {
          errorMessage = 'Database error during signup. Please check your information and try again.';
        } else if (result.error.message.includes('duplicate key value violates unique constraint "users_email_key"')) {
          errorMessage = 'An account with this email already exists. Please try signing in instead.';
          toast.error('An account with this email already exists. Please try signing in instead.');
          setLoading(false);
          return;
        } else if (result.error.message.includes('email')) {
          errorMessage = 'Please check your email address and try again.';
        } else if (result.error.message.includes('password')) {
          errorMessage = 'Please check your password requirements and try again.';
        } else if (result.error.message.includes('duplicate')) {
          errorMessage = 'This account already exists. Please try signing in instead.';
        }
        
        toast.error(errorMessage);
        return;
      }

      if (result.data.user) {
        try {
          // Manually create the patient profile as a backup
          await createUserProfile(result.data.user.id, {
            full_name: name,
            phone_number: 'Not provided',
            date_of_birth: dateOfBirth
          });

          toast.success('Account created successfully! Check your email for verification.');
          router.push('/verify-email?email=' + encodeURIComponent(email));
        } catch (profileError) {
          console.error('Profile creation error:', profileError);
          toast.error('Account created but profile setup failed. Please contact support.');
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during signup';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-2">
      <div className="w-full max-w-md mx-auto bg-card rounded-2xl shadow-xl p-8 flex flex-col items-center border border-border">
        <div className="w-full flex items-center justify-between mb-6">
          <Link
            href="/login"
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to login
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold mb-2 text-center text-foreground">Create your account</h1>
        <p className="text-muted-foreground mb-6 text-center">Sign up to get started</p>
        
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
              required
              aria-label="Full Name"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
              required
              aria-label="Email Address"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-1">
              Date of Birth
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              This will not be shown publicly. Confirm your own age, even if this account is for a business, a pet, or something else.
            </p>
            <div className="flex gap-2">
              <select
                value={month}
                onChange={e => setMonth(e.target.value)}
                className="flex-1 px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                required
                aria-label="Month"
              >
                <option value="">Month</option>
                {months.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select
                value={day}
                onChange={e => setDay(e.target.value)}
                className="w-1/3 px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                required
                aria-label="Day"
              >
                <option value="">Day</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select
                value={year}
                onChange={e => setYear(e.target.value)}
                className="w-1/3 px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                required
                aria-label="Year"
              >
                <option value="">Year</option>
                {Array.from({ length: 120 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isNextEnabled || loading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-semibold shadow hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 