"use client";

import { useCallback, useState, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type Role = "doctor" | "patient";

export interface SignupParams {
  email: string;
  password: string;
  fullName: string;
  role: Role;
  dateOfBirth?: string;
}

interface UseSignupReturn {
  signup: (params: SignupParams) => Promise<{ user: User | null; error: string | null }>;
  user: User | null;
  error: string | null;
  loading: boolean;
}

export function useSignup(): UseSignupReturn {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const isSubmittingRef = useRef(false);

  const signup = useCallback(async ({ email, password, fullName, role, dateOfBirth }: SignupParams) => {
    if (isSubmittingRef.current) {
      return { user: null, error: "Signup already in progress. Please wait..." };
    }

    isSubmittingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // TODO: Add rate limiting or captcha to prevent abuse
      await new Promise(resolve => setTimeout(resolve, 100));

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback?next=/dashboard`,
          data: {
            full_name: fullName,
            role,
            date_of_birth: dateOfBirth || new Date().toISOString().split('T')[0],
          },
        },
      });

      if (signUpError) {
        const message = signUpError.message || "Signup failed.";
        setError(message);
        setLoading(false);
        isSubmittingRef.current = false;
        return { user: null, error: message };
      }

      const createdUser = data.user ?? null;

      // Do not upsert into any local profile table here; rely on DB trigger to populate patients
      setUser(createdUser);
      setLoading(false);
      isSubmittingRef.current = false;
      return { user: createdUser, error: null };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unexpected error during signup.";
      setError(message);
      setLoading(false);
      isSubmittingRef.current = false;
      return { user: null, error: message };
    }
  }, []);

  return { signup, user, error, loading };
} 