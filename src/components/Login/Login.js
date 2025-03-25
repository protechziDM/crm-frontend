// src/components/Login/Login.js
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../TopHeader/traslogobold.png';
import loginimage from './sdsds.png';
import axios from 'axios';
import LoginLayout from '../Layout/LoginLayout';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');
    const baseUrl = process.env.REACT_APP_API_BASE_URL; // Get baseUrl from env

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        try {
            const response = await axios.post(`${baseUrl}/api/login`, { // Use baseUrl
                username,
                password,
            });

            const { token, user } = response.data;
            // Pass both user and token to the AuthContext login function
            login(user, token);
            navigate('/');
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                setErrorMessage(error.response.data.error);
            } else {
                setErrorMessage('Login failed. Please try again.');
            }
        }
    };

    return (
        <LoginLayout>
            <div className="login-container-layout">
                <img src={logo} alt="Logo" className="image-logo" />
                <div className="login-main-sec">
                    <div className="login-form-column">
                        <form onSubmit={handleLogin}>
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button type="submit">Login</button>
                            {errorMessage && <p className="error-message">{errorMessage}</p>}
                        </form>
                    </div>
                    <div className="image-form-column">
                        <img src={loginimage} alt="Banner" className="image-logo-bann" />
                    </div>
                </div>
            </div>
        </LoginLayout>
    );
}

export default Login;