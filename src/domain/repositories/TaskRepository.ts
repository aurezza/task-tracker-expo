import { Result } from '../../core/types';
import { Task } from '../entities/Task';

export interface TaskRepository {
  fetchTasks(userId: string): Promise<Result<Task[]>>;
  createTask(userId: string, title: string, description?: string, categoryId?: string, deadline?: string): Promise<Result<Task>>;
  updateTask(taskId: string, userId: string, updates: Partial<Task>): Promise<Result<Task>>;
  deleteTask(taskId: string, userId: string): Promise<Result<void>>;
}
