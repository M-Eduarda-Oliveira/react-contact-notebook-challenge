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
  const [updatedContactId, setUpdatedContactId] = useState(-1);
  const [isEditMode, setIsEditMode] = useState(false);

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
    createContactMutation.mutate(newContact);
    resetFields();
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

  const updatecontactMutation = useMutation(
    async (updatedcontact: Contact) => {
      const response = await fetch(
        `http://localhost:3000/contacts/${updatedcontact.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedcontact),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update the contact");
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("contacts");
      },
    }
  );

  const handleEditContact = (contact: Contact) => {
    setIsEditMode(true);

    setNewContactName(contact.name);
    setNewContactEmail(contact.email);
    setNewContactPhone(contact.phone);
    setUpdatedContactId(contact.id);
  };

  const handleClickEdit = () => {
    const editedContact = {
      id: updatedContactId,
      name: newContactName,
      phone: newContactPhone,
      email: newContactEmail
    }
    updatecontactMutation.mutate(editedContact);

    resetFields();
  } 

  if (isFetching) {
    return <Loading />;
  }

  if (isError) {
    return <AppError />;
  }

  const resetFields = () => {
    setIsEditMode(false);
    setNewContactName('') 
    setNewContactEmail('');
    setNewContactPhone('');
    setUpdatedContactId(-1);
  }

  return (
    <div>
      <h1>Contatos</h1>
      <div className="contacts">
        <input type="text" id="new-contact-name" placeholder="Name" onChange={(event)=>setNewContactName(event.target.value)} value ={newContactName} />
        <input type="text" id="new-contact-email" placeholder="Email" onChange={(event)=>setNewContactEmail(event.target.value)} value ={newContactEmail}/>
        <input type="text" id="new-contact-phone" placeholder="Phone" onChange={(event)=>setNewContactPhone(event.target.value)} value ={newContactPhone}/>
        <div className="buttons-container">
          {isEditMode && <button onClick={()=> resetFields()}>Cancel</button>}
          {isEditMode && <button onClick={()=> handleClickEdit()}>Save</button>}
          {!isEditMode && <button onClick={()=> handleCreateContact()}>Add</button>}
        </div>
        {contacts.map((contact: Contact) => (
          <ContactCard
            key={contact.id}
            name={contact.name}
            email={contact.email}
            phone={contact.phone}
            handleDelete={()=> handleDeleteContact(contact.id)}
            handleEdit={() => handleEditContact(contact)}
          />
        ))}
      </div>
    </div>
  );
}
