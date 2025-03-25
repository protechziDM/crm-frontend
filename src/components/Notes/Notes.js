import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Notes.css';
import { FaPlus } from 'react-icons/fa';
import DateFormat from '../DateFormat/DateFormat';
import { BsCheckSquareFill, BsXSquareFill, BsTrash } from "react-icons/bs";

function Notes({ leadId, currentUserId }) {
    const [notes, setNotes] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [authors, setAuthors] = useState({});

    const fetchNotes = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/notes/${leadId}`);
            const sortedNotes = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setNotes(sortedNotes);
            sortedNotes.forEach(note => {
                if (!authors[note.author_id]) {
                    fetchAuthor(note.author_id);
                }
            });
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    }, [leadId, authors]); // Added authors as a dependency

    const fetchAuthor = async (authorId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/users/${authorId}`);
            setAuthors(prevAuthors => ({ ...prevAuthors, [authorId]: response.data.name }));
        } catch (error) {
            console.error('Error fetching author:', error);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const handleAddNoteClick = () => {
        setIsAddingNote(true);
    };

    const handleAddNote = async () => {
        try {
            await axios.post('http://localhost:5000/api/notes', {
                lead_id: leadId,
                message: newMessage,
                author_id: currentUserId,
            });
            setNewMessage('');
            setIsAddingNote(false);
            setSuccessMessage('Note added successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
            fetchNotes();
        } catch (error) {
            console.error('Error adding note:', error);
        }
    };

    const handleCancelNote = () => {
        setIsAddingNote(false);
        setNewMessage('');
    };

    const handleDeleteNote = async (noteId) => {
        if (window.confirm("Are you sure you want to delete this note?")) {
            try {
                await axios.delete(`http://localhost:5000/api/notes/${noteId}`);
                fetchNotes();
            } catch (error) {
                console.error('Error deleting note:', error);
            }
        }
    };

    return (
        <div className="notes-container">
            {successMessage && (
                <div className="success-tooltip">
                    {successMessage}
                </div>
            )}
            {!isAddingNote && (
                <button className="add-note-button" onClick={handleAddNoteClick}>
                    <FaPlus /> Add Note
                </button>
            )}

            {isAddingNote && (
                <div className="add-note-form">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Enter a new note"
                    />
                    <div className="note-icon-container">
                        <BsCheckSquareFill className="submit-note-icon" onClick={handleAddNote} />
                        <BsXSquareFill className="cancel-note-icon" onClick={handleCancelNote} />
                    </div>
                </div>
            )}

            <div className="notes-list">
                {notes.map((note) => (
                    <div key={note.id} className="note-item">
                        <div className="note-header">
                            <span className="author-name">{authors[note.author_id] || 'Unknown'}</span>
                            <span className="note-date">
                                - <DateFormat dateString={note.created_at} />
                                <BsTrash
                                    className="delete-note-icon"
                                    onClick={() => handleDeleteNote(note.id)}
                                />
                            </span>
                        </div>
                        <div className="note-message">{note.message}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Notes;