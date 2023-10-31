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
  const [updatedNoteId, setUpdatedNoteId] = useState(-1);
  const [isEditMode, setIsEditMode] = useState(false);

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

  const updateNoteMutation = useMutation(
    async (updatedNote: Note) => {
      const response = await fetch(
        `http://localhost:3000/notes/${updatedNote.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedNote),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update the note");
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("notes");
      },
    }
  );

  const handleEditNote = (note: Note) => {
    setIsEditMode(true);

    setNewNoteTitle(note.title);
    setNewNoteContent(note.description);
    setUpdatedNoteId(note.id);
  };

  const handleClickEdit = () => {
    const editedNote: Note = {
      id: updatedNoteId,
      title: newNoteTitle,
      description: newNoteContent,
    }
    updateNoteMutation.mutate(editedNote);

    resetFields();
  } 

  const resetFields = () => {
    setIsEditMode(false);
    setNewNoteTitle('') 
    setNewNoteContent('');
    setUpdatedNoteId(-1);
  }

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
      <input type="text" id="new-note-title" placeholder="Title" onChange={(event)=>setNewNoteTitle(event.target.value)} value={newNoteTitle}/>
        <input type="text" id="new-note-content" placeholder="Content" onChange={(event)=>setNewNoteContent(event.target.value)} value={newNoteContent}/>
        <div>
          {isEditMode && <button onClick={()=> resetFields()}>Cancel</button>}
          {isEditMode && <button onClick={()=> handleClickEdit()}>Save</button>}
          {!isEditMode && <button onClick={()=> handleCreateNote()}>Add</button>}

        </div>
        {notes.map((note: Note) => (
          <NoteCard
            key={note.id}
            title={note.title}
            description={note.description}
            handleDelete={()=> handleDeleteNote(note.id)}
            handleEdit={() => handleEditNote(note)}
          />
        ))}
      </div>
    </div>
  );
}
