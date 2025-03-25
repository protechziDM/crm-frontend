import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Users.css';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false;

function Users() {
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [user_type, setuser_type] = useState(1);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editUsername, setEditUsername] = useState('');
    const [editName, setEditName] = useState('');
    const [edituser_type, setEdituser_type] = useState(1);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [passwordUserId, setPasswordUserId] = useState(null);
    const [passwordUserName, setPasswordUserName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { isAdmin, isLoggedIn } = useAuth();
    const navigate = useNavigate();

    const handleCancelEdit = () => {
        setEditId(null);
    };

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate('/login');
        } else if (!isAdmin()) {
            navigate('/');
        } else {
            fetchUsers();
        }
    }, [isAdmin, isLoggedIn, navigate]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/users');
            setUsers(response.data);
            console.log("Users Data:", response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/users', { username, name, password, user_type });
            setMessage('User created successfully!');
            setError(false);
            fetchUsers();
            setUsername('');
            setName('');
            setPassword('');
        } catch (error) {
            setMessage('Error: ' + error.response.data.error);
            setError(true);
        }
    };

    const handleEditUser = async (userId) => {
        setMessage('');
        try {
            await axios.put(`http://localhost:5000/api/users/${userId}`, {
                username: editUsername,
                name: editName,
                user_type: edituser_type,
            });
            setMessage('User updated successfully!');
            setError(false);
            fetchUsers();
            setEditId(null);
        } catch (error) {
            setMessage('Error updating user: ' + error.response.data.error);
            setError(true);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure?')) {
            try {
                await axios.delete(`http://localhost:5000/api/users/${userId}`);
                setMessage('User deleted successfully!');
                setError(false);
                fetchUsers();
            } catch (error) {
                setMessage('Error deleting user: ' + error.response.data.error);
                setError(true);
            }
        }
    };

    const handleOpenPasswordModal = (userId, userName) => {
        setPasswordUserId(userId);
        setPasswordUserName(userName);
        setPasswordModalOpen(true);
    };

    const handleClosePasswordModal = () => {
        setPasswordModalOpen(false);
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage('Passwords do not match.');
            setError(true);
            return;
        }
        try {
            await axios.put(`http://localhost:5000/api/users/password/${passwordUserId}`, { password: newPassword });
            setMessage('Password updated successfully!');
            setError(false);
            handleClosePasswordModal();
        } catch (error) {
            setMessage('Error updating password: ' + error.response.data.error);
            setError(true);
        }
    };

    const handleUserStatusUpdate = async (userId, currentAttempts) => {
        // Toggle between 0 and 5
        const newAttempts = currentAttempts === 0 ? 5 : 0;
        try {
            await axios.put(`http://localhost:5000/api/users/status/${userId}`, { status: newAttempts });
            fetchUsers();
        } catch (err) {
            console.error('Error updating status', err);
        }
    };

    if (!isAdmin()) {
        return null;
    }

    return (
        <div className="users-container">
            <div className="add-user-form">
                <h2>Add New User</h2>
                <form onSubmit={handleAddUser}>
                    <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <select value={user_type} onChange={(e) => setuser_type(parseInt(e.target.value))}>
                        <option value={1}>Admin</option>
                        <option value={0}>Client</option>
                    </select>
                    <button type="submit">Add User</button>
                    {message && <div className={`message ${error ? 'error' : 'success'}`}>{message}</div>}
                </form>
            </div>
            <h2>Existing Users</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Name</th>
                        <th>user_type</th>
                        <th>Login Attempts</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>
                                {editId === user.id ? (
                                    <input type="text" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} />
                                ) : (
                                    user.username
                                )}
                            </td>
                            <td>
                                {editId === user.id ? (
                                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
                                ) : (
                                    user.name
                                )}
                            </td>
                            <td>
                                {editId === user.id ? (
                                    <select value={edituser_type} onChange={(e) => setEdituser_type(parseInt(e.target.value))}>
                                        <option value={1}>Admin</option>
                                        <option value={0}>Client</option>
                                    </select>
                                ) : (
                                    user.user_type === 1 ? 'Admin' : 'Client'
                                )}
                            </td>
                            <td>{user.login_attempts}</td>
                            <td>
                            <label className="user-status-switch">
                                    <input
                                        type="checkbox"
                                        checked={user.login_attempts < 5}
                                        onChange={() => handleUserStatusUpdate(user.id, user.login_attempts)}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </td>
                            <td className="actions-column">
                                {editId === user.id ? (
                                    <>
                                        <button onClick={() => handleEditUser(user.id)}>Save</button>
                                        <button onClick={handleCancelEdit}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => {
                                            setEditId(user.id);
                                            setEditUsername(user.username);
                                            setEditName(user.name);
                                            setEdituser_type(user.user_type);
                                        }}>Edit</button>
                                        <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                                        <button className="edit-password-button" onClick={() => handleOpenPasswordModal(user.id, user.name)}>Change Password</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {passwordModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close-button" onClick={handleClosePasswordModal}>&times;</span>
                        <h2>Change Password for {passwordUserName}</h2>
                        <form onSubmit={handleUpdatePassword}>
                            <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                            <button type="submit">Update Password</button>
                            {message && <div className={`message ${error ? 'error' : 'success'}`}>{message}</div>}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Users;