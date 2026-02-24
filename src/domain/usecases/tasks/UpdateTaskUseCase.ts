import { Result } from '@/core/types';
import { Task } from '../../entities/Task';
import { TaskRepository } from '../../repositories/TaskRepository';

export class UpdateTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(taskId: string, userId: string, updates: Partial<Task>): Promise<Result<Task>> {
    return this.taskRepository.updateTask(taskId, userId, updates);
  }
}
