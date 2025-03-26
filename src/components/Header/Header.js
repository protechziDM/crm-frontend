import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Header.css';
import profilePic from './Fav.jpg';
import { FaHome, FaUsers, FaChartLine, FaPlus, FaListAlt, FaArchive, FaFileUpload, FaMoneyBill } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import axios from 'axios';

function Header() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [leadCount, setLeadCount] = useState(0);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const fetchLeadCount = async () => {
            if (user && user.id) {
                try {
                    let response;
                    if (isAdmin()) {
                        response = await axios.get(`${baseUrl}/api/leads/count`);
                    } else {
                        response = await axios.get(`${baseUrl}/api/leads/count/user/${user.id}`);
                    }
                    setLeadCount(response.data.count);
                } catch (error) {
                    console.error('Error fetching lead count:', error);
                }
            }
        };

        fetchLeadCount();
    }, [user, isAdmin, baseUrl]);

    return (
        <header className="header-container">
            <div className="user-info">
                <img src={profilePic} alt="Profile" className="profile-pic" />
                <div className="user-details">
                    <p className="user-name">{user?.name || 'User'}</p>
                    <p className="welcome-message">Welcome to CRM</p>
                </div>
            </div>
            <hr className="divider-header" />
            <div className="lead-count">
                <p>Total Leads: {leadCount}</p>
            </div>
            <hr className="divider-header" />
            <nav className="navigation">
                <Link to="/" className="nav-link">
                    <FaHome /> Dashboard
                </Link>
                <Link to="/leads" className="nav-link">
                    <FaListAlt /> Leads
                </Link>
            </nav>

            {/* Conditional rendering for payment section */}
            {user && (user.type === 1 || user.id === 2) && (
                <div className="payment-section-head">
                    <hr className="divider-header" />
                    <Link to="/all-payments" className="nav-link">
                        <FaMoneyBill /> Payments
                    </Link>
                    <Link to="/seo-payments" className="nav-link">
                        <FaMoneyBill /> SEO Payments
                    </Link>
                    <Link to="/hosting-payments" className="nav-link">
                        <FaMoneyBill /> Hosting Payment
                    </Link>
                    <Link to="/web-maintenance" className="nav-link">
                        <FaMoneyBill /> Web Maintenance
                    </Link>
                </div>
            )}
            {isAdmin() && (
                <div className="admin-section">
                    <hr className="divider-header" />
                    <Link to="/global-data" className="nav-link">
                        <FaChartLine /> Global Data
                    </Link>
                    <Link to="/lead-upload" className="nav-link">
                        <FaFileUpload /> Upload Leads
                    </Link>
                    <Link to="/leads-archive" className="nav-link">
                        <FaArchive /> Lead Archive
                    </Link>
                    <Link to="/payment-archive" className="nav-link">
                        <FaArchive /> Payment Archive
                    </Link>
                    <Link to="/users" className="nav-link">
                        <FaUsers /> Users
                    </Link>
                </div>
            )}
            <hr className="divider-header" />
            <div className="create-lead">
                <button className="create-lead-button" onClick={() => navigate('/lead-form')}>
                    <FaPlus /> Create Lead
                </button>
                <button
                    className={`logout-button ${isLoggingOut ? 'logging-out' : ''}`}
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                >
                    <FiLogOut className="logout-icon" />
                    <span className="logout-text">Logout</span>
                </button>
            </div>
        </header>
    );
}

export default Header;
