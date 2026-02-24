import { Result } from '@/core/types';
import { Task } from '../../entities/Task';
import { TaskRepository } from '../../repositories/TaskRepository';

export class GetTasksUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(userId: string): Promise<Result<Task[]>> {
    return this.taskRepository.fetchTasks(userId);
  }
}
