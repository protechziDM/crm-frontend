// src/contexts/BreadcrumbContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BreadcrumbContext = createContext();

export const BreadcrumbProvider = ({ children }) => {
    const [breadcrumbs, setBreadcrumbs] = useState([]);
    const location = useLocation();

    useEffect(() => {
        let newBreadcrumbs = ['Home']; // Always start with 'Home'

        if (location.pathname !== '/') {
            const pathSegments = location.pathname.split('/').filter(segment => segment);
            newBreadcrumbs = ['Home', ...pathSegments];
        }

        setBreadcrumbs(newBreadcrumbs);
    }, [location.pathname]);

    return (
        <BreadcrumbContext.Provider value={{ breadcrumbs }}>
            {children}
        </BreadcrumbContext.Provider>
    );
};

export const useBreadcrumb = () => useContext(BreadcrumbContext);