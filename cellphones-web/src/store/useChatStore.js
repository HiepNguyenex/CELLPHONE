// === FILE: src/store/useChatStore.js ===
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useChatStore = create(
  persist(
    (set, get) => ({
      sessionId: null,
      messages: [],         // [{id, role: 'user'|'bot', text, ts}]
      unread: 0,
      setSession(id) { set({ sessionId: id }); },
      push(role, text) {
        set((s) => ({
          messages: [...s.messages, { id: crypto.randomUUID(), role, text, ts: new Date().toISOString() }],
        }));
      },
      replaceMessages(list) { set({ messages: list }); },
      incUnread() { set((s) => ({ unread: Math.min(s.unread + 1, 99) })); },
      clearUnread() { set({ unread: 0 }); },
      reset() { set({ sessionId: null, messages: [], unread: 0 }); },
    }),
    {
      // ✅ bump version để “invalidate” localStorage cũ (xoá sid rác)
      name: "cps_chat_store_v2",
    }
  )
);
