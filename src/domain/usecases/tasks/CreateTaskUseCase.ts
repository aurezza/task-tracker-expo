import { Result } from '@/core/types';
import { Task } from '../../entities/Task';
import { TaskRepository } from '../../repositories/TaskRepository';

export class CreateTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(userId: string, title: string, description?: string, categoryId?: string, deadline?: string): Promise<Result<Task>> {
    if (!title.trim()) {
        return { success: false, error: new Error("Title is required") };
    }
    return this.taskRepository.createTask(userId, title, description, categoryId, deadline);
  }
}
