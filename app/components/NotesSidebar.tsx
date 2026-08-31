"use client";

import { Note } from "../types";
import NoteListItem from "./NoteListItem";
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

  async function handleAddNote(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const response = await fetch(`/api/trips/${tripId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newNoteContent }),
    });
    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to add note:", error);
      return;
    }
    const newNote = await response.json();
    onNoteAdd(newNote);
    setNewNoteContent("");
  }

  return (
    <div className="border border-gray-200 rounded-lg flex flex-col h-[600px]">
      <div className="px-4 py-3 border-b border-gray-200 font-semibold text-gray-900 text-sm">
        Notes
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {notes.length === 0 && <p className="text-sm text-gray-400">No notes yet</p>}
        {notes.map((note) => (
          <NoteListItem key={note.id} note={note} onUpdate={onNoteUpdate} onDelete={onNoteDelete} />
        ))}
      </div>

      <form onSubmit={handleAddNote} className="p-3 border-t border-gray-200 flex gap-2">
        <input
          type="text"
          value={newNoteContent}
          placeholder="Add a note"
          onChange={(e) => setNewNoteContent(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-gray-400"
          required
        />
        <button
          type="submit"
          className="bg-gray-900 text-white text-sm font-medium px-3 py-1.5 rounded hover:bg-gray-700 shrink-0"
        >
          Post
        </button>
      </form>
    </div>
  );
}
