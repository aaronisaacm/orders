import { create } from "zustand";

type Store = {
    isAuthenticated: boolean;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
}

export const useAuthStore = create<Store>()((set) => ({
    isAuthenticated: false,
    setIsAuthenticated: (isAuthenticated: boolean) => set(() => ({ isAuthenticated })),
}))