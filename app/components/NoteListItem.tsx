"use client";

import { Note } from "../types";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { PencilIcon, TrashIcon } from "./Icons";
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
            className="flex-1 min-w-0"
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
      <span className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => setIsEditing(true)}
          aria-label="Edit note"
          title="Edit note"
          className="text-gray-400 hover:text-gray-900 p-1"
        >
          <PencilIcon className="w-3.5 h-3.5" />
        </button>
        <form onSubmit={handleDeleteNote} className="inline">
          <button type="submit" aria-label="Delete note" title="Delete note" className="text-gray-400 hover:text-red-600 p-1">
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        </form>
      </span>
    </li>
  );
}
