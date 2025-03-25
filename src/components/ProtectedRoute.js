// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth(); // Destructure loading

    const location = useLocation(); // Get the current location

    if (loading) {
        return <div>Loading...</div>; // Or a loading spinner
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />; // Redirect to login if not logged in
    }

    return children;
};

export default ProtectedRoute;