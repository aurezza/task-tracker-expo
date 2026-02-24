import { SupabaseAuthRepository } from '../data/repositories/SupabaseAuthRepository';
import { SupabaseTaskRepository } from '../data/repositories/SupabaseTaskRepository';
import { LoginUseCase } from '../domain/usecases/auth/LoginUseCase';
import { LogoutUseCase } from '../domain/usecases/auth/LogoutUseCase';
import { RegisterUseCase } from '../domain/usecases/auth/RegisterUseCase';
import { RestoreSessionUseCase } from '../domain/usecases/auth/RestoreSessionUseCase';
import { CreateTaskUseCase } from '../domain/usecases/tasks/CreateTaskUseCase';
import { DeleteTaskUseCase } from '../domain/usecases/tasks/DeleteTaskUseCase';
import { GetTasksUseCase } from '../domain/usecases/tasks/GetTasksUseCase';
import { UpdateTaskUseCase } from '../domain/usecases/tasks/UpdateTaskUseCase';

// Repositories
const authRepository = new SupabaseAuthRepository();
const taskRepository = new SupabaseTaskRepository();

// Auth Use Cases
export const loginUseCase = new LoginUseCase(authRepository);
export const registerUseCase = new RegisterUseCase(authRepository);
export const logoutUseCase = new LogoutUseCase(authRepository);
export const restoreSessionUseCase = new RestoreSessionUseCase(authRepository);

// Task Use Cases
export const getTasksUseCase = new GetTasksUseCase(taskRepository);
export const createTaskUseCase = new CreateTaskUseCase(taskRepository);
export const updateTaskUseCase = new UpdateTaskUseCase(taskRepository);
export const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository);

// New Repositories
import { SupabaseCategoryRepository } from '../data/repositories/SupabaseCategoryRepository';
import { SupabaseProfileRepository } from '../data/repositories/SupabaseProfileRepository';
import {
  CreateCategoryUseCase, DeleteCategoryUseCase,
  GetCategoriesUseCase,
  GetProfileUseCase, UpdateProfileUseCase
} from '../domain/usecases/AdditionalUseCases';

const profileRepository = new SupabaseProfileRepository();
const categoryRepository = new SupabaseCategoryRepository();

// New Use Cases
export const getProfileUseCase = new GetProfileUseCase(profileRepository);
export const updateProfileUseCase = new UpdateProfileUseCase(profileRepository);
export const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);
export const createCategoryUseCase = new CreateCategoryUseCase(categoryRepository);
export const deleteCategoryUseCase = new DeleteCategoryUseCase(categoryRepository);
