import { Result } from '@/core/types';
import { Session } from '@supabase/supabase-js';
import { AuthRepository } from '../../repositories/AuthRepository';

export class RestoreSessionUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(): Promise<Result<Session | null>> {
    return this.authRepository.restoreSession();
  }
}
