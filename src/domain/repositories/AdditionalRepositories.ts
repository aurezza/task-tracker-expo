import { Result } from '@/core/types';
import { Category, Profile } from '../entities/AdditionalEntities';

export interface ProfileRepository {
  getProfile(userId: string): Promise<Result<Profile>>;
  updateProfile(userId: string, updates: Partial<Profile>): Promise<Result<Profile>>;
}

export interface CategoryRepository {
  getCategories(userId: string): Promise<Result<Category[]>>;
  createCategory(userId: string, name: string, color?: string): Promise<Result<Category>>;
  deleteCategory(categoryId: string, userId: string): Promise<Result<void>>;
}
