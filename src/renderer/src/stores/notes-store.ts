import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Note {
  id: string;
  title: string;
  description: string;
  badges?: { label: string; color: string }[];
}

interface NotesState {
  notes: Note[];
  addNote: (note: Omit<Note, "id">) => void;
  updateNote: (id: string, updates: Partial<Omit<Note, "id">>) => void;
  deleteNote: (id: string) => void;
  toggleNoteComplete: (id: string) => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set) => ({
      notes: [],
      addNote: (note) =>
        set((state) => ({
          notes: [...state.notes, { ...note, id: String(Date.now()) }],
        })),
      updateNote: (id, updates) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...updates } : note
          ),
        })),
      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        })),
      toggleNoteComplete: (id) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, badges: note.badges } : note
          ),
        })),
    }),
    {
      name: "wems-notes",
    }
  )
);
