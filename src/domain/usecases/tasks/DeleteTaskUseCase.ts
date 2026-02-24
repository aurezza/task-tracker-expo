import { Result } from '@/core/types';
import { TaskRepository } from '../../repositories/TaskRepository';

export class DeleteTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(taskId: string, userId: string): Promise<Result<void>> {
    return this.taskRepository.deleteTask(taskId, userId);
  }
}
