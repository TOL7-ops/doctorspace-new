'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [useEmail, setUseEmail] = useState(false);
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);

  const isNextEnabled = name && ((useEmail && email) || (!useEmail && phone)) && month && day && year;

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNextEnabled) return;
    setLoading(true);
    try {
      const dateOfBirth = `${year}-${String(months.indexOf(month) + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      let result;
      if (useEmail) {
        result = await supabase.auth.signUp({
          email,
          password: Math.random().toString(36).slice(-10) + 'A!', // temp password, you can prompt for real one
          options: {
            data: {
              full_name: name,
              date_of_birth: dateOfBirth,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
      } else {
        result = await supabase.auth.signUp({
          phone,
          password: Math.random().toString(36).slice(-10) + 'A!',
          options: {
            data: {
              full_name: name,
              date_of_birth: dateOfBirth,
            },
          },
        });
      }
      if (result.error) {
        toast.error(result.error.message || 'Signup failed.');
        setLoading(false);
        return;
      }
      toast.success('Account created! Check your email or phone for verification.');
      if (useEmail) {
        router.push('/verify-email?email=' + encodeURIComponent(email));
      } else {
        router.push('/login');
      }
    } catch (err: any) {
      toast.error(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-2">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-md mx-auto p-0 sm:p-0 border border-border">
        <form onSubmit={handleNext} className="flex flex-col">
          <div className="flex justify-end p-4">
            <button type="button" aria-label="Close" className="text-2xl text-muted-foreground hover:text-foreground">&times;</button>
          </div>
          <div className="px-8 pb-8 flex flex-col gap-6">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black tracking-tight mb-2">✕</span>
              <h2 className="text-2xl font-bold text-center mb-2">Create your account</h2>
            </div>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-md border border-input bg-background text-foreground px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
                required
                aria-label="Name"
              />
              {!useEmail ? (
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full rounded-md border border-input bg-background text-foreground px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    required={!useEmail}
                    aria-label="Phone"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-primary text-sm underline"
                    onClick={() => setUseEmail(true)}
                  >
                    Use email instead
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-md border border-input bg-background text-foreground px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    required={useEmail}
                    aria-label="Email"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-primary text-sm underline"
                    onClick={() => setUseEmail(false)}
                  >
                    Use phone instead
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <label className="font-semibold text-foreground text-sm">Date of birth</label>
              <p className="text-xs text-muted-foreground mb-2">
                This will not be shown publicly. Confirm your own age, even if this account is for a business, a pet, or something else.
              </p>
              <div className="flex gap-2">
                <select
                  value={month}
                  onChange={e => setMonth(e.target.value)}
                  className="flex-1 rounded-md border border-input bg-background text-foreground px-2 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="w-1/3 rounded-md border border-input bg-background text-foreground px-2 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="w-1/3 rounded-md border border-input bg-background text-foreground px-2 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary"
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
              className={`w-full mt-6 py-3 rounded-full text-lg font-semibold transition text-primary-foreground ${isNextEnabled && !loading ? 'bg-primary hover:bg-primary/90 cursor-pointer' : 'bg-muted cursor-not-allowed'}`}
            >
              {loading ? 'Creating account...' : 'Next'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 