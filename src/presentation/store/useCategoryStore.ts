import { createCategoryUseCase, deleteCategoryUseCase, getCategoriesUseCase } from '@/core/services';
import { Category } from '@/domain/entities/AdditionalEntities';
import { create } from 'zustand';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: (userId: string) => Promise<void>;
  addCategory: (userId: string, name: string, color?: string) => Promise<void>;
  deleteCategory: (categoryId: string, userId: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async (userId) => {
    set({ isLoading: true, error: null });
    const result = await getCategoriesUseCase.execute(userId);
    if (result.success) {
      set({ categories: result.data, isLoading: false });
    } else {
      set({ error: 'Failed to fetch categories', isLoading: false });
    }
  },

  addCategory: async (userId, name, color) => {
    set({ isLoading: true });
    const result = await createCategoryUseCase.execute(userId, name, color);
    if (result.success) {
      set((state) => ({ categories: [...state.categories, result.data], isLoading: false }));
    } else {
      set({ error: 'Failed to create category', isLoading: false });
    }
  },

  deleteCategory: async (categoryId, userId) => {
    set({ isLoading: true });
    const result = await deleteCategoryUseCase.execute(categoryId, userId);
    if (result.success) {
      set((state) => ({ 
        categories: state.categories.filter((c) => c.id !== categoryId), 
        isLoading: false 
      }));
    } else {
      set({ error: 'Failed to delete category', isLoading: false });
    }
  },
}));
