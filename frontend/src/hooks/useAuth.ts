import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { confirmEmailForDev, getMe } from '../lib/api';
import toast from 'react-hot-toast';
import type { User } from '../types';

function userFromSession(sessionUser: any): User {
  return {
    id: sessionUser.id,
    email: sessionUser.email || '',
    full_name: sessionUser.user_metadata?.full_name || null,
    avatar_url: null,
    total_interviews: 0,
    avg_score: 0,
    created_at: sessionUser.created_at,
  };
}

async function getMeWithTimeout(timeoutMs = 2500) {
  return Promise.race([
    getMe(),
    new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error('Profile request timed out')), timeoutMs);
    }),
  ]);
}

export function useAuth() {
  const { user, isLoading, isAuthenticated, setUser, setLoading, logout: storeLogout } = useAuthStore();

  useEffect(() => {
    // Check for existing session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(userFromSession(session.user));
          getMeWithTimeout().then(setUser).catch(() => undefined);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };
    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(userFromSession(session.user));
        getMeWithTimeout().then(setUser).catch(() => undefined);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    try {
      await confirmEmailForDev(email);
      toast.success('Account created. You can sign in now.');
    } catch {
      toast.success('Account created! Please check your email to verify.');
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        await confirmEmailForDev(email);
        const retry = await supabase.auth.signInWithPassword({ email, password });
        if (retry.error) throw retry.error;
        if (retry.data.user) {
          setUser(userFromSession(retry.data.user));
          getMeWithTimeout().then(setUser).catch(() => undefined);
        }
      } else {
        throw error;
      }
    } else if (data.user) {
      setUser(userFromSession(data.user));
      getMeWithTimeout().then(setUser).catch(() => undefined);
    }
    toast.success('Welcome back!');
  };

  const logout = async () => {
    await supabase.auth.signOut();
    storeLogout();
    toast.success('Signed out');
  };

  return { user, isLoading, isAuthenticated, signUp, signIn, logout };
}
