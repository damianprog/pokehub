import { create } from "zustand";

type ModalMode = "login" | "signup" | null;

interface AuthModalStore {
  mode: ModalMode;
  open: (mode: "login" | "signup") => void;
  close: () => void;
}

export const useAuthModal = create<AuthModalStore>((set) => ({
  mode: null,
  open: (mode) => set({ mode }),
  close: () => set({ mode: null }),
}));
