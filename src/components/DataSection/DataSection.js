// src/components/DataSection/DataSection.js
import React, { useState } from 'react';
import axios from 'axios';
import './DataSection.css';

function DataSection({ title, data, fetchData, url }) {
    const [newInput, setNewInput] = useState('');
    const [editId, setEditId] = useState(null);
    const [editInput, setEditInput] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);

    const handleAdd = async () => {
        try {
            setErrorMessage(null);
            await axios.post(url, { name: newInput });
            fetchData();
            setNewInput('');
        } catch (error) {
            console.error('Error adding data:', error);
            setErrorMessage('Failed to add data. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        try {
            setErrorMessage(null);
            await axios.delete(`${url}/${id}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting data:', error);
            setErrorMessage('Failed to delete data. Please try again.');
        }
    };

    const handleUpdate = async (id, newName) => {
        try {
            setErrorMessage(null);
            await axios.put(`${url}/${id}`, { name: newName });
            fetchData();
            setEditId(null);
        } catch (error) {
            console.error('Error updating data:', error);
            setErrorMessage('Failed to update data. Please try again.');
        }
    };

    return (
        <section className="data-section">
            <h3>{title}</h3>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <ul>
                {data.map((item) => (
                    <li key={item.id}>
                        {editId === item.id ? (
                            <input
                                type="text"
                                value={editInput}
                                onChange={(e) => setEditInput(e.target.value)}
                            />
                        ) : (
                            item.name
                        )}
                        <div>
                            {editId === item.id ? (
                                <>
                                    <button onClick={() => handleUpdate(item.id, editInput)}>Save</button>
                                    <button onClick={() => setEditId(null)}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => {
                                        setEditId(item.id);
                                        setEditInput(item.name);
                                    }}>Edit</button>
                                    <button onClick={() => handleDelete(item.id)}>Delete</button>
                                </>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleAdd();
                }}
            >
                <input
                    type="text"
                    value={newInput}
                    onChange={(e) => setNewInput(e.target.value)}
                    placeholder={`New ${title.replace(/s$/, '')}`}
                />
                <button type="submit">Add {title.replace(/s$/, '')}</button>
            </form>
        </section>
    );
}

export default DataSection;