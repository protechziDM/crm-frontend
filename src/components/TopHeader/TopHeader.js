import React, { useState, useEffect, useRef } from 'react';
import './TopHeader.css';
import logo from './traslogobold.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

function TopHeader() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const searchRef = useRef(null);
    const { user, isAdmin, isLoggedIn } = useAuth();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [searchResults]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setIsDropdownOpen(true);
    };

    useEffect(() => {
        if (searchTerm) {
            const fetchLeads = async () => {
                try {
                    let url = 'http://localhost:5000/api/leads';
                    if (!isAdmin() && user) {
                        url += `/user/${user.id}`;
                    }
                    const leadsResponse = await axios.get(url);
                    const leads = leadsResponse.data;

                    const searchString = searchTerm.trim().toLowerCase();

                    const filteredResults = leads.filter(lead => {
                        return (
                            (lead.lead_no && lead.lead_no.toString().toLowerCase().includes(searchString)) ||
                            (lead.name && lead.name.toLowerCase().includes(searchString)) ||
                            (lead.email1 && lead.email1.toLowerCase().includes(searchString)) ||
                            (lead.phone_no && lead.phone_no.toString().toLowerCase().includes(searchString)) ||
                            (lead.cell_no && lead.cell_no.toString().toLowerCase().includes(searchString)) ||
                            (lead.website && lead.website.toLowerCase().includes(searchString))
                        );
                    });

                    setSearchResults(filteredResults);
                    console.log("Search Results:", searchResults); //Debugging
                } catch (error) {
                    console.error('Error fetching search results:', error);
                    setSearchResults([]);
                }
            };
            fetchLeads();
        } else {
            setSearchResults([]);
        }
    }, [searchTerm, user, isAdmin]);

    const handleSearchResultClick = (leadId, leadNo) => {
        console.log("Clicked Lead:", leadId, leadNo); //Debugging
        navigate(`/lead/${leadId}/${leadNo}`);
        setSearchTerm('');
        setIsDropdownOpen(false);
    };

    return (
        <div className="top-header">
            <div className="left-column">
                <img src={logo} alt="Logo" className="image-logo" />
            </div>
            <div className="right-column">
                <div className="search-container" ref={searchRef}>
                    <input
                        type="text"
                        placeholder="Search Leads..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                    {isDropdownOpen && searchResults.length > 0 && (
                        <ul className="search-dropdown">
                            {searchResults.map((lead) => (
                                <li
                                    key={lead.id}
                                    onClick={() => handleSearchResultClick(lead.id, lead.lead_no)}
                                    className="search-dropdown-item"
                                >
                                    {lead.lead_no}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="right-user-icon">
                    <img
                        src="http://localhost:3000/static/media/Fav.1fb5b829f375c68bd85e.jpg"
                        alt="User Profile"
                        className="user-image"
                    />
                </div>
            </div>
        </div>
    );
}

export default TopHeader;