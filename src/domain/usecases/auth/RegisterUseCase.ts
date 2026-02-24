import { Result } from '@/core/types';
import { Session } from '@supabase/supabase-js';
import { AuthRepository } from '../../repositories/AuthRepository';

export class RegisterUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(email: string, pass: string): Promise<Result<Session>> {
    // Domain validation (e.g. password strength)
    if (pass.length < 6) {
        return { success: false, error: new Error("Password must be at least 6 characters") };
    }
    return this.authRepository.register(email, pass);
  }
}
