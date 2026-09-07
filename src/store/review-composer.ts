import { create } from "zustand";

interface ReviewComposerStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useReviewComposer = create<ReviewComposerStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
