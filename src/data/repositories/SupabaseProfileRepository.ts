import { supabase } from '../../core/supabase';
import { Result } from '../../core/types';
import { Profile } from '../../domain/entities/AdditionalEntities';
import { ProfileRepository } from '../../domain/repositories/AdditionalRepositories';

export class SupabaseProfileRepository implements ProfileRepository {
  async getProfile(userId: string): Promise<Result<Profile>> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    // If profile doesn't exist (e.g. created before trigger was added), create one? 
    // Or just return error/null. For now, basic fetch.
    if (error) return { success: false, error };
    return { success: true, data: data as Profile };
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Result<Profile>> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) return { success: false, error };
    return { success: true, data: data as Profile };
  }
}
