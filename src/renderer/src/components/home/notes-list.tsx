"use client";

import { Maximize } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Badge {
  label: string;
  color: "blue" | "green" | "yellow" | "orange" | "red" | "teal" | "gray" | "purple" | "cyan" | "violet" | "indigo" | "emerald" | "amber" | "rose";
}

interface Note {
  id: string;
  title: string;
  description: string;
  badges?: Badge[];
  completed?: boolean;
}

interface NotesListProps {
  notes: Note[];
}

export function NotesList({ notes }: NotesListProps) {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [completedNotes, setCompletedNotes] = useState<Set<string>>(new Set());

  const toggleComplete = (noteId: string) => {
    setCompletedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(noteId)) {
        next.delete(noteId);
      } else {
        next.add(noteId);
      }
      return next;
    });
  };

  if (notes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No notes yet</p>
    );
  }

  return (
    <>
      <div className="flex flex-col">
        {notes.map((note, index) => (
          <div key={note.id} className="flex flex-col">
            <div className="group flex flex-col gap-1 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Checkbox
                        checked={completedNotes.has(note.id)}
                        onCheckedChange={() => toggleComplete(note.id)}
                      />
                    </TooltipTrigger>
                    <TooltipContent>{completedNotes.has(note.id) ? "Mark as incomplete" : "Mark as complete"}</TooltipContent>
                  </Tooltip>
                  <p className={`text-sm font-medium ${completedNotes.has(note.id) ? "line-through text-muted-foreground" : ""}`}>{note.title}</p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-6 w-6 shrink-0 text-muted-foreground"
                      onClick={() => setSelectedNote(note)}
                    >
                      <Maximize className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Open note</TooltipContent>
                </Tooltip>
              </div>
              <p className={`text-xs text-muted-foreground ${completedNotes.has(note.id) ? "line-through" : ""}`}>{note.description}</p>
              {note.badges && note.badges.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.badges.map((badge, idx) => (
                    <StatusBadge key={idx} color={badge.color} className="rounded-sm">
                      {badge.label}
                    </StatusBadge>
                  ))}
                </div>
              )}
            </div>
            {index < notes.length - 1 && <div className="border-b" />}
          </div>
        ))}
      </div>

      <Dialog open={!!selectedNote} onOpenChange={() => setSelectedNote(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedNote?.title}</DialogTitle>
            <DialogDescription>{selectedNote?.description}</DialogDescription>
          </DialogHeader>
          {selectedNote?.badges && selectedNote.badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedNote.badges.map((badge, idx) => (
                <StatusBadge key={idx} color={badge.color}>
                  {badge.label}
                </StatusBadge>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
