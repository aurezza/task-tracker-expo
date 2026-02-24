import { getProfileUseCase, updateProfileUseCase } from '@/core/services';
import { Profile } from '@/domain/entities/AdditionalEntities';
import { create } from 'zustand';

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (userId: string, updates: Partial<Profile>) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async (userId) => {
    set({ isLoading: true, error: null });
    const result = await getProfileUseCase.execute(userId);
    if (result.success) {
      set({ profile: result.data, isLoading: false });
    } else {
      // It's possible the profile doesn't exist yet if the trigger failed or old user
      set({ error: result.error instanceof Error ? result.error.message : 'Failed', isLoading: false });
    }
  },

  updateProfile: async (userId, updates) => {
    set({ isLoading: true, error: null });
    const result = await updateProfileUseCase.execute(userId, updates);
    if (result.success) {
      set({ profile: result.data, isLoading: false });
    } else {
      set({ error: result.error instanceof Error ? result.error.message : 'Failed', isLoading: false });
    }
  },
}));
