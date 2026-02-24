import { Result } from '@/core/types';
import { Session } from '@supabase/supabase-js';
import { AuthRepository } from '../../repositories/AuthRepository';

export class LoginUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(email: string, pass: string): Promise<Result<Session>> {
    // Add any domain logic here (e.g. email validation) if needed
    if (!email || !pass) {
        return { success: false, error: new Error("Email and password are required") };
    }
    return this.authRepository.login(email, pass);
  }
}
