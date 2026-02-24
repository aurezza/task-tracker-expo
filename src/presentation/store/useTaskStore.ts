import {
    createTaskUseCase,
    deleteTaskUseCase,
    getTasksUseCase,
    updateTaskUseCase
} from '@/core/services';
import { Task } from '@/domain/entities/Task';
import { create } from 'zustand';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: (userId: string) => Promise<void>;
  addTask: (userId: string, title: string, description?: string, categoryId?: string, deadline?: string) => Promise<void>;
  updateTask: (taskId: string, userId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string, userId: string) => Promise<void>;
  toggleTaskCompletion: (taskId: string, userId: string, currentStatus: boolean) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async (userId) => {
    set({ isLoading: true, error: null });
    const result = await getTasksUseCase.execute(userId);
    if (result.success) {
      set({ tasks: result.data, isLoading: false });
    } else {
      set({ error: result.error instanceof Error ? result.error.message : 'Failed to fetch tasks', isLoading: false });
    }
  },

  addTask: async (userId, title, description, categoryId, deadline) => {
     // Optimistic update could be done here, but let's stick to simple implementation first
    set({ isLoading: true, error: null });
    const result = await createTaskUseCase.execute(userId, title, description, categoryId, deadline);
    if (result.success) {
      set((state) => ({ tasks: [result.data, ...state.tasks], isLoading: false }));
    } else {
      set({ error: result.error instanceof Error ? result.error.message : 'Failed to create task', isLoading: false });
    }
  },

  updateTask: async (taskId, userId, updates) => {
    set({ isLoading: true, error: null });
    const result = await updateTaskUseCase.execute(taskId, userId, updates);
    if (result.success) {
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? result.data : t)),
        isLoading: false,
      }));
    } else {
      set({ error: result.error instanceof Error ? result.error.message : 'Failed to update task', isLoading: false });
    }
  },

  deleteTask: async (taskId, userId) => {
    set({ isLoading: true, error: null });
    const result = await deleteTaskUseCase.execute(taskId, userId);
    if (result.success) {
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId),
        isLoading: false,
      }));
    } else {
      set({ error: result.error instanceof Error ? result.error.message : 'Failed to delete task', isLoading: false });
    }
  },

  toggleTaskCompletion: async (taskId, userId, currentStatus) => {
      // Reuse updateTask
      await get().updateTask(taskId, userId, { completed: !currentStatus });
  }
}));
