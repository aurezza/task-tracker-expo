import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../core/supabase';
import { Result } from '../../core/types';
import { AuthRepository } from '../../domain/repositories/AuthRepository';

export class SupabaseAuthRepository implements AuthRepository {
  async login(email: string, pass: string): Promise<Result<Session>> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    
    if (error) {
      console.log(error)
      return { success: false, error };
    }
    
    // Supabase returns a session object in data.session
    if (!data.session) {
        return { success: false, error: new Error("No session returned") };
    }

    return { success: true, data: data.session };
  }

  async register(email: string, pass: string): Promise<Result<Session>> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
    });

    if (error) {
      return { success: false, error };
    }

     if (!data.session) {
        // Depending on email confirmation settings, session might be null.
        // For this task we assume it returns a session or we handle it.
        // If email confirmation is required, we might return success but no session.
        // For simplicity let's assume auto-confirm or session is returned.
        if (data.user && !data.session) {
             return { success: false, error: new Error("Please check your email for confirmation link") };
        }
        return { success: false, error: new Error("No session created") };
    }

    return { success: true, data: data.session };
  }

  async logout(): Promise<Result<void>> {
    const { error } = await supabase.auth.signOut();
    if (error) return { success: false, error };
    return { success: true, data: undefined };
  }

  async restoreSession(): Promise<Result<Session | null>> {
    const { data, error } = await supabase.auth.getSession();
    if (error) return { success: false, error };
    return { success: true, data: data.session };
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
}
