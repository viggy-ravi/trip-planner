"use client";

import { Note } from "../types";
import NoteListItem from "./NoteListItem";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { useState } from "react";

export default function NotesSidebar({
  tripId,
  notes,
  onNoteAdd,
  onNoteUpdate,
  onNoteDelete,
}: {
  tripId: number;
  notes: Note[];
  onNoteAdd: (note: Note) => void;
  onNoteUpdate: (updated: Note) => void;
  onNoteDelete: (id: number) => void;
}) {
  const [newNoteContent, setNewNoteContent] = useState("");
  const [error, setError] = useState("");

  async function handleAddNote(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const response = await fetch(`/api/trips/${tripId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newNoteContent }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "Failed to add note");
      return;
    }
    const newNote = await response.json();
    onNoteAdd(newNote);
    setNewNoteContent("");
  }

  return (
    <div className="border border-gray-200 rounded-lg flex flex-col h-[600px]">
      <div className="px-4 py-3 border-b border-gray-200 font-semibold text-gray-900 text-sm">
        Feed
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {notes.length === 0 && <p className="text-sm text-gray-400">No posts yet</p>}
        {notes.map((note) => (
          <NoteListItem key={note.id} note={note} onUpdate={onNoteUpdate} onDelete={onNoteDelete} />
        ))}
      </div>

      {error && <p className="text-xs text-red-600 px-3">{error}</p>}
      <form onSubmit={handleAddNote} className="p-3 border-t border-gray-200 flex gap-2">
        <label className="sr-only" htmlFor="new-note-content">Add a note</label>
        <Input
          id="new-note-content"
          type="text"
          value={newNoteContent}
          placeholder="Add a note"
          onChange={(e) => setNewNoteContent(e.target.value)}
          className="flex-1 min-w-0"
          required
        />
        <Button type="submit" size="sm" className="shrink-0">Post</Button>
      </form>
    </div>
  );
}
