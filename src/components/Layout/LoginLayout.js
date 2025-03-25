// src/components/Layout/LoginLayout.js
import React from 'react';
import './LoginLayout.css'; // Optional: Add styles

function LoginLayout({ children }) {
    return (
        <div className="login-layout-container">
            {children}
        </div>
    );
}

export default LoginLayout;