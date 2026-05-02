import { SignInData, SignUpData } from '@/types/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SignUpFormState {
  signUpForm: SignUpData;
  setSignUpForm: (data: SignUpData) => void;
}

export const useSignUpFormStore = create<SignUpFormState>()(
  persist(
    (set) => ({
      signUpForm: {},
      setSignUpForm: (data) => set((state) => ({ ...state, signUpForm: data })),
    }),
    {
      name: 'signup-form-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
