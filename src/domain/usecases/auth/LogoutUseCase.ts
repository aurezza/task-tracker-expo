import { Result } from '@/core/types';
import { AuthRepository } from '../../repositories/AuthRepository';

export class LogoutUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(): Promise<Result<void>> {
    return this.authRepository.logout();
  }
}
