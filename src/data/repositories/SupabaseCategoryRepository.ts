import { supabase } from '../../core/supabase';
import { Result } from '../../core/types';
import { Category } from '../../domain/entities/AdditionalEntities';
import { CategoryRepository } from '../../domain/repositories/AdditionalRepositories';

export class SupabaseCategoryRepository implements CategoryRepository {
  async getCategories(userId: string): Promise<Result<Category[]>> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) return { success: false, error };
    return { success: true, data: data as Category[] };
  }

  async createCategory(userId: string, name: string, color?: string): Promise<Result<Category>> {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ user_id: userId, name, color }])
      .select()
      .single();

    if (error) return { success: false, error };
    return { success: true, data: data as Category };
  }

  async deleteCategory(categoryId: string, userId: string): Promise<Result<void>> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', userId);

    if (error) return { success: false, error };
    return { success: true, data: undefined };
  }
}
