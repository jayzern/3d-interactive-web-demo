import { create } from "zustand";

export type PanelKind = "chat" | "dashboard";

export type Target = {
  id: string;
  name: string;
  kind: PanelKind;
};

type GameState = {
  /** Interactable the player is currently standing inside the trigger volume of. */
  nearby: Target | null;
  /** Panel currently on screen. Non-null means the player has handed control to the DOM. */
  open: Target | null;
  enter: (target: Target) => void;
  leave: (id: string) => void;
  openPanel: () => void;
  close: () => void;
};

export const useGame = create<GameState>((set, get) => ({
  nearby: null,
  open: null,

  enter: (target) => set({ nearby: target }),

  // Trigger volumes overlap, so walking from one NPC straight to the next fires
  // the old NPC's exit *after* the new one's enter. Clearing unconditionally would
  // swallow the target the player actually just reached.
  leave: (id) => set((s) => (s.nearby?.id === id ? { nearby: null } : {})),

  openPanel: () => {
    const { nearby, open } = get();
    if (nearby && !open) set({ open: nearby });
  },

  close: () => set({ open: null }),
}));
