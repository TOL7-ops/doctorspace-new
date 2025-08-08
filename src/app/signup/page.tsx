"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [resending, setResending] = useState(false);

  const isFormValid = Boolean(firstName && lastName && email && password);

  const handleResend = async () => {
    try {
      setResending(true);
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) throw error;
      toast.success("Verification email resent. Please check your inbox.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to resend verification email.";
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowResend(false);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (error) {
        let message = error.message || "Signup failed. Please try again.";
        const lower = message.toLowerCase();
        if (
          lower.includes("users_email_key") ||
          lower.includes("already registered") ||
          lower.includes("already exists")
        ) {
          message = "An account with this email already exists. Try signing in or resend verification.";
          setShowResend(true);
        } else if (lower.includes("password")) {
          message = "Please choose a stronger password (min 6 characters).";
        } else if (lower.includes("email")) {
          message = "Please enter a valid email address.";
        }
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Account created! Check your email to verify your account.");
      router.push("/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      toast.error(message);
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

        <form onSubmit={handleSubmit} className="w-full" aria-label="Create Account Form">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800" role="alert">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              {showResend && (
                <div className="mt-3">
                  <Button type="button" variant="outline" className="w-full" onClick={handleResend} disabled={resending}>
                    {resending ? "Resending..." : "Resend verification email"}
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-1">
              First Name
            </label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="Enter your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              aria-label="First Name"
              autoComplete="given-name"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-1">
              Last Name
            </label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Enter your last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              aria-label="Last Name"
              autoComplete="family-name"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email"
              autoComplete="email"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-label="Password"
                autoComplete="new-password"
                className="pr-10"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">At least 6 characters</p>
          </div>

          <Button
            type="submit"
            disabled={!isFormValid || loading}
            className="w-full"
            aria-disabled={!isFormValid || loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </Button>

          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Already have an account? {" "}
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