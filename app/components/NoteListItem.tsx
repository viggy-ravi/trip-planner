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
      <li>
        <form onSubmit={handleEditNote}>
          <input type="text" value={content} onChange={(e) => setContent(e.target.value)} />
          <button type="submit">Save</button>
        </form>
      </li>
    );
  }

  return (
    <li>
      {note.content}
      {" — "}
      {note.author.name}
      {" "}
      <button onClick={() => setIsEditing(true)}>Edit</button>
      {" "}
      <form onSubmit={handleDeleteNote} style={{ display: "inline" }}>
        <button type="submit">Delete</button>
      </form>
    </li>
  );
}
