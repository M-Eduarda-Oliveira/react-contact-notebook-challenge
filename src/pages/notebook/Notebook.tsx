import { useState } from "react";
import AppError from "../../components/AppError/Error";
import Loading from "../../components/Loading/Loading";
import NoteCard from "../../components/NoteCard/NoteCard";
import { Note, newNote } from "../../types/Note";
import "./Notebook.css";
import { useMutation, useQuery, useQueryClient } from "react-query";

export default function Notebook() {
  const queryClient = useQueryClient()
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const {
    data: notes,
    isFetching,
    isError,
  } = useQuery("notes", async () => {
    const response = await fetch("http://localhost:3000/notes");
    if (!response.ok) {
      throw new Error("Erro ao carregar os dados da lista de contatos");
    }

    return response.json();
  });

  const createNoteMutation = useMutation(
    async (newNote: newNote) => {
      const response = await fetch("http://localhost:3000/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...newNote }),
      });
      if (!response.ok) {
        throw new Error("Failed to create a new note");
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("notes");
      },
    }
  )

  const handleCreateNote = () => {
    const newNote = {
      title: newNoteTitle,
      content: newNoteContent
    }
    createNoteMutation.mutate(newNote)
  }

  const deleteNoteMutation = useMutation(
    async (id: number) => {
      const response = await fetch(`http://localhost:3000/notes/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete this note");
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("notes");
      },
    }
  )

  const handleDeleteNote = (id: number) => {
    deleteNoteMutation.mutate(id)
  };

  const handleEditNote = () => {
    // Lógica para edição aqui
  };

  if (isFetching) {
    return <Loading />;
  }

  if (isError) {
    return <AppError />;
  }

  return (
    <div>
      <h1>Bloco de notas</h1>
      <div className="notebook">
      <input type="text" id="new-note-title" placeholder="Title" onChange={(event)=>setNewNoteTitle(event.target.value)}/>
        <input type="text" id="new-note-content" placeholder="Content" onChange={(event)=>setNewNoteContent(event.target.value)}/>
        <button onClick={()=> handleCreateNote()}>Add</button>
        {notes.map((note: Note) => (
          <NoteCard
            key={note.id}
            title={note.title}
            description={note.description}
            handleDelete={()=> handleDeleteNote(note.id)}
            handleEdit={handleEditNote}
          />
        ))}
      </div>
    </div>
  );
}
