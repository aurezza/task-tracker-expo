import { Result } from '@/core/types';
import { Category, Profile } from '../../entities/AdditionalEntities';
import { CategoryRepository, ProfileRepository } from '../../repositories/AdditionalRepositories';

export class GetProfileUseCase {
  constructor(private repo: ProfileRepository) {}
  async execute(userId: string): Promise<Result<Profile>> {
    return this.repo.getProfile(userId);
  }
}

export class UpdateProfileUseCase {
  constructor(private repo: ProfileRepository) {}
  async execute(userId: string, updates: Partial<Profile>): Promise<Result<Profile>> {
    return this.repo.updateProfile(userId, updates);
  }
}

export class GetCategoriesUseCase {
  constructor(private repo: CategoryRepository) {}
  async execute(userId: string): Promise<Result<Category[]>> {
    return this.repo.getCategories(userId);
  }
}

export class CreateCategoryUseCase {
  constructor(private repo: CategoryRepository) {}
  async execute(userId: string, name: string, color?: string): Promise<Result<Category>> {
    if (!name.trim()) return { success: false, error: new Error("Name required") };
    return this.repo.createCategory(userId, name, color);
  }
}

export class DeleteCategoryUseCase {
  constructor(private repo: CategoryRepository) {}
  async execute(categoryId: string, userId: string): Promise<Result<void>> {
    return this.repo.deleteCategory(categoryId, userId);
  }
}
