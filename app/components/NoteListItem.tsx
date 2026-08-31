"use client";

import { Note } from "../types";
import Button from "./ui/Button";
import Input from "./ui/Input";
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
  const [error, setError] = useState("");

  async function handleEditNote(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const response = await fetch(`/api/notes/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "Failed to update note");
      return;
    }
    const updatedNote = await response.json();
    onUpdate(updatedNote);
    setIsEditing(false);
  }

  async function handleDeleteNote(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const response = await fetch(`/api/notes/${note.id}`, { method: "DELETE" });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "Failed to delete note");
      return;
    }
    onDelete(note.id);
  }

  if (isEditing) {
    return (
      <li className="border border-gray-200 rounded-lg p-3">
        <form onSubmit={handleEditNote} className="flex gap-2">
          <label className="sr-only" htmlFor={`note-content-${note.id}`}>Note</label>
          <Input
            id={`note-content-${note.id}`}
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Save</Button>
        </form>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </li>
    );
  }

  return (
    <li className="border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between gap-2">
      <span className="text-sm text-gray-900">
        {note.content}
        <span className="text-gray-500"> — {note.author.name}</span>
        {error && <span className="text-xs text-red-600 block">{error}</span>}
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
