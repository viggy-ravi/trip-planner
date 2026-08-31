"use client";

import { Note } from "../types";
import { useState } from "react";

export default function NoteListItem({
  note,
  onUpdate,
  onDelete,
}: {
  note: Note;
  onUpdate: (updated: Note) => void;
  onDelete: (id: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(note.content);

  async function handleEditNote(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const response = await fetch(`/api/notes/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to update note:", error);
      return;
    }
    const updatedNote = await response.json();
    onUpdate(updatedNote);
    setIsEditing(false);
  }

  async function handleDeleteNote(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const response = await fetch(`/api/notes/${note.id}`, { method: "DELETE" });
    if (!response.ok) {
      console.error("Failed to delete note");
      return;
    }
    onDelete(note.id);
  }

  if (isEditing) {
    return (
      <li className="border border-gray-200 rounded-lg p-3">
        <form onSubmit={handleEditNote} className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <button
            type="submit"
            className="bg-gray-900 text-white text-sm font-medium px-4 py-1.5 rounded hover:bg-gray-700"
          >
            Save
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className="border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between gap-2">
      <span className="text-sm text-gray-900">
        {note.content}
        <span className="text-gray-500"> — {note.author.name}</span>
      </span>
      <span className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setIsEditing(true)}
          className="text-xs text-gray-500 hover:text-gray-900"
        >
          Edit
        </button>
        <form onSubmit={handleDeleteNote} className="inline">
          <button type="submit" className="text-xs text-red-600 hover:text-red-800">
            Delete
          </button>
        </form>
      </span>
    </li>
  );
}
