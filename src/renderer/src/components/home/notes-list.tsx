"use client";

import { Maximize, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Note } from "@/actions/database";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type BadgeColor = "blue" | "green" | "yellow" | "orange" | "red" | "teal" | "gray" | "purple" | "cyan" | "violet" | "indigo" | "emerald" | "amber" | "rose";

const getBadgeColorClass = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-500",
    green: "bg-green-500/10 border-green-500/20 text-green-500",
    yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
    orange: "bg-orange-500/10 border-orange-500/20 text-orange-500",
    red: "bg-red-500/10 border-red-500/20 text-red-500",
    teal: "bg-teal-500/10 border-teal-500/20 text-teal-500",
    gray: "bg-gray-500/10 border-gray-500/20 text-gray-500",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-500",
    cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-500",
    violet: "bg-violet-500/10 border-violet-500/20 text-violet-500",
    indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-500",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-500",
    rose: "bg-rose-500/10 border-rose-500/20 text-rose-500",
  };
  return colorMap[color] || colorMap.gray;
};

interface NotesListProps {
  notes: Note[];
  onToggleComplete?: (noteId: number, isCompleted: boolean) => void;
  onDeleteNote?: (noteId: number) => void;
}

export function NotesList({ notes, onToggleComplete, onDeleteNote }: NotesListProps) {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

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
                        checked={note.isCompleted}
                        onCheckedChange={(checked) => {
                          if (onToggleComplete) {
                            onToggleComplete(note.id, !!checked);
                          }
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>{note.isCompleted ? "Mark as incomplete" : "Mark as complete"}</TooltipContent>
                  </Tooltip>
                  <p className={`text-sm font-medium ${note.isCompleted ? "line-through text-muted-foreground" : ""}`}>{note.title}</p>
                </div>
                <div className="flex items-center gap-1">
                  {onDeleteNote && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => onDeleteNote(note.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete note</TooltipContent>
                    </Tooltip>
                  )}
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
              </div>
              <p className={`text-xs text-muted-foreground ${note.isCompleted ? "line-through" : ""}`}>
                {note.description || "No description"}
              </p>
              {note.badges && note.badges.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.badges.map((badge, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getBadgeColorClass(badge.color)}`}
                    >
                      {badge.name}
                    </span>
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
            <DialogDescription>
              {selectedNote?.description || "No description"}
            </DialogDescription>
          </DialogHeader>
          {selectedNote?.badges && selectedNote.badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedNote.badges.map((badge, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getBadgeColorClass(badge.color)}`}
                >
                  {badge.name}
                </span>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
