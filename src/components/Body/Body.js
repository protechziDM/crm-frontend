// src/components/Body/Body.js
import React from 'react';
import './Body.css';

function Body({ children }) {
    return (
        <div className="body">
            {children}
        </div>
    );
}

export default Body;