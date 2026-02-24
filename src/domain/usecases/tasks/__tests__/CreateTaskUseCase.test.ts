import { TaskRepository } from '../../../repositories/TaskRepository';
import { CreateTaskUseCase } from '../CreateTaskUseCase';

// Mock the repository
const mockTaskRepository = {
  fetchTasks: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
} as unknown as TaskRepository;

describe('CreateTaskUseCase', () => {
  let createTaskUseCase: CreateTaskUseCase;

  beforeEach(() => {
    createTaskUseCase = new CreateTaskUseCase(mockTaskRepository);
    jest.clearAllMocks();
  });

  it('should call createTask on the repository', async () => {
    const userId = 'user-123';
    const title = 'New Task';
    const description = 'Description';

    (mockTaskRepository.createTask as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: 'task-1', userId, title, description, completed: false, created_at: new Date().toISOString() }
    });

    const result = await createTaskUseCase.execute(userId, title, description);

    expect(mockTaskRepository.createTask).toHaveBeenCalledWith(userId, title, description, undefined);
    expect(result.success).toBe(true);
  });

  it('should validation fail if title is empty', async () => {
    const result = await createTaskUseCase.execute('user-1', '   ');
    expect(result.success).toBe(false);
    expect(mockTaskRepository.createTask).not.toHaveBeenCalled();
  });
});
