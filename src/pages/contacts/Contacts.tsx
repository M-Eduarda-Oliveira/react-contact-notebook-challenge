import { useState } from "react";
import AppError from "../../components/AppError/Error";
import ContactCard from "../../components/ContactCard/ContactCard";
import Loading from "../../components/Loading/Loading";
import { Contact, newContact } from "../../types/Contact";
import "./Contacts.css";
import { useMutation, useQuery, useQueryClient } from "react-query";

export default function Contacts() {
  const queryClient = useQueryClient()
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const {
    data: contacts,
    isFetching,
    isError,
  } = useQuery("contacts", async () => {
    const response = await fetch("http://localhost:3000/contacts");
    if (!response.ok) {
      throw new Error("Erro ao carregar os dados da lista de contatos");
    }

    return response.json();
  });

  const createContactMutation = useMutation(
    async (newContact: newContact) => {
      const response = await fetch("http://localhost:3000/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...newContact }),
      });
      if (!response.ok) {
        throw new Error("Failed to create a new contact");
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("contacts");
      },
    }
  )

  const handleCreateContact = () => {
    const newContact = {
      name: newContactName,
      phone: newContactPhone,
      email: newContactEmail
    }
    createContactMutation.mutate(newContact)
  }

  const deleteContactMutation = useMutation(
    async (id: number) => {
      const response = await fetch(`http://localhost:3000/contacts/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete this contact");
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("contacts");
      },
    }
  )

  const handleDeleteContact = (id: number) => {
    deleteContactMutation.mutate(id)
  };

  const handleEditContact = () => {
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
      <h1>Contatos</h1>
      <div className="contacts">
        <input type="text" id="new-contact-name" placeholder="Name" onChange={(event)=>setNewContactName(event.target.value)}/>
        <input type="text" id="new-contact-email" placeholder="Email" onChange={(event)=>setNewContactEmail(event.target.value)}/>
        <input type="text" id="new-contact-phone" placeholder="Phone" onChange={(event)=>setNewContactPhone(event.target.value)}/>
        <button onClick={()=> handleCreateContact()}>Add</button>
        {contacts.map((contact: Contact) => (
          <ContactCard
            key={contact.id}
            name={contact.name}
            email={contact.email}
            phone={contact.phone}
            handleDelete={()=> handleDeleteContact(contact.id)}
            handleEdit={handleEditContact}
          />
        ))}
      </div>
    </div>
  );
}
