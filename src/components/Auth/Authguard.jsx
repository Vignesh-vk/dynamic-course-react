import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthGuard = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token) {
        return <Navigate to="/" />;
    }
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

export default AuthGuard;
