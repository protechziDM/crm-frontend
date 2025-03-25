import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom';
import '@fortawesome/fontawesome-svg-core/styles.css'; // Add this line
import { config } from '@fortawesome/fontawesome-svg-core'; // Add this line
config.autoAddCss = false; // And this line

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Router>
            <AuthProvider>
                <App />
            </AuthProvider>
        </Router>
    </React.StrictMode>
);

reportWebVitals();