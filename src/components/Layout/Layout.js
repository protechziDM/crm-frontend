// src/components/Layout/Layout.js
import React, { useState } from 'react';
import TopHeader from '../TopHeader/TopHeader';
import Header from '../Header/Header';
import Body from '../Body/Body'; // Import the Body component
import './Layout.css';

function Layout({ children }) {
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

    const toggleHeader = () => {
        setIsHeaderCollapsed(!isHeaderCollapsed);
    };

    return (
        <div className="layout-container">
            <TopHeader />
            <header className={isHeaderCollapsed ? 'collapsed' : ''}>
                <Header toggleHeader={toggleHeader} />
            </header>
            <div className="layout-body">
                <Body>{children}</Body> {/* Render the Body component here */}
            </div>
        </div>
    );
}

export default Layout;