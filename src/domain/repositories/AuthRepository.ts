import { Session } from '@supabase/supabase-js';
import { Result } from '../../core/types';
import { User } from '../entities/User';

export interface AuthRepository {
  login(email: string, pass: string): Promise<Result<Session>>;
  register(email: string, pass: string): Promise<Result<Session>>;
  logout(): Promise<Result<void>>;
  restoreSession(): Promise<Result<Session | null>>;
  getCurrentUser(): Promise<User | null>;
}
