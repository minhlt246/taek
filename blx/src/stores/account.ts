import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  isVerified?: boolean;
  kycStatus?: "pending" | "approved" | "rejected";
}

interface Asset {
  id: string;
  symbol: string;
  balance: number;
  available: number;
  frozen: number;
}

interface Referral {
  code: string;
  link: string;
}

interface AccountState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginSuccess: boolean;
  account: User | null;
  assets: Asset[];
  referral: Referral | null;

  // User methods
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setLoginSuccess: (success: boolean) => void;
  setAccount: (account: User | null) => void;
  setAssets: (assets: Asset[]) => void;
  setReferral: (referral: Referral | null) => void;

  // Auth methods
  login: (user: User, token: string) => void;
  logout: () => void;
  reset: () => void;

  // Update methods
  updateUser: (updates: Partial<User>) => void;
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      loginSuccess: false,
      account: null,
      assets: [],
      referral: null,

      // User methods
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
      setLoginSuccess: (loginSuccess) => set({ loginSuccess }),
      setAccount: (account) => set({ account }),
      setAssets: (assets) => set({ assets }),
      setReferral: (referral) => set({ referral }),

      // Auth methods
      login: (user, token) =>
        set({
          user,
          account: user,
          token,
          isAuthenticated: true,
          loginSuccess: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          account: null,
          token: null,
          isAuthenticated: false,
          loginSuccess: false,
          isLoading: false,
          assets: [],
          referral: null,
        }),

      reset: () =>
        set({
          user: null,
          account: null,
          token: null,
          isAuthenticated: false,
          loginSuccess: false,
          isLoading: false,
          assets: [],
          referral: null,
        }),

      // Update methods
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
          account: state.account ? { ...state.account, ...updates } : null,
        })),
    }),
    {
      name: "account-storage",
      partialize: (state) => ({
        user: state.user,
        account: state.account,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loginSuccess: state.loginSuccess,
        assets: state.assets,
        referral: state.referral,
      }),
    }
  )
);
