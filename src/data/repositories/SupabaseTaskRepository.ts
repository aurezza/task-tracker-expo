import { supabase } from '../../core/supabase';
import { Result } from '../../core/types';
import { Task } from '../../domain/entities/Task';
import { TaskRepository } from '../../domain/repositories/TaskRepository';

export class SupabaseTaskRepository implements TaskRepository {
  async fetchTasks(userId: string): Promise<Result<Task[]>> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return { success: false, error };
    return { success: true, data: data as Task[] };
  }

  async createTask(userId: string, title: string, description?: string, categoryId?: string, deadline?: string): Promise<Result<Task>> {
    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          user_id: userId,
          title,
          description,
          completed: false,
          category_id: categoryId || null,
          deadline: deadline || null,
        },
      ])
      .select()
      .single();

    if (error) return { success: false, error };
    return { success: true, data: data as Task };
  }

  async updateTask(taskId: string, userId: string, updates: Partial<Task>): Promise<Result<Task>> {
     const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .eq('user_id', userId) // Ensure ownership
      .select()
      .single();

    if (error) return { success: false, error };
    return { success: true, data: data as Task };
  }

  async deleteTask(taskId: string, userId: string): Promise<Result<void>> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);

    if (error) return { success: false, error };
    return { success: true, data: undefined };
  }
}
