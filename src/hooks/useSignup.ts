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

  const signup = useCallback(async ({ email, password, fullName, role }: SignupParams) => {
    // Prevent multiple simultaneous submissions
    if (isSubmittingRef.current) {
      return { user: null, error: "Signup already in progress. Please wait..." };
    }

    // Set submitting flag immediately
    isSubmittingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // Add a small delay to prevent rapid clicks
      await new Promise(resolve => setTimeout(resolve, 100));

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        // Keep redirect to callback so verified users land in app
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
      });

      if (signUpError) {
        const message = signUpError.message || "Signup failed.";
        setError(message);
        setLoading(false);
        isSubmittingRef.current = false;
        return { user: null, error: message };
      }

      const createdUser = data.user ?? null;

      // If we have a user, create/update their profile with role and full name
      if (createdUser) {
        const profileInsert = {
          id: createdUser.id,
          full_name: fullName,
          role,
          created_at: new Date().toISOString(),
        };

        const { error: profileError } = await supabase
          .from("profiles")
          .upsert(profileInsert, { onConflict: "id" });

        if (profileError) {
          const message = profileError.message || "Failed to create profile.";
          setError(message);
          setLoading(false);
          isSubmittingRef.current = false;
          return { user: createdUser, error: message };
        }
      }

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