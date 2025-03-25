import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './Leads.css';
import { useAuth } from '../../contexts/AuthContext';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { BsTelephone } from "react-icons/bs";

function Leads() {
    const [leads, setLeads] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const leadsPerPage = 30;
    const { user, isAdmin, isLoggedIn } = useAuth();
    const [leadStatuses, setLeadStatuses] = useState([]);
    const navigate = useNavigate();
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterCountry, setFilterCountry] = useState('');
    const [leadTypes, setLeadTypes] = useState([]);
    const [countries, setCountries] = useState([]);

    useEffect(() => {
        const fetchLeadsAndStatuses = async () => {
            if (!isLoggedIn()) {
                navigate('/login');
                return;
            }

            setLoading(true);
            try {
                let url = 'http://localhost:5000/api/leads';
                if (!isAdmin() && user) {
                    url += `/user/${user.id}`;
                }
                const leadsResponse = await axios.get(url);
                let processedLeads = leadsResponse.data.map(lead => ({
                    ...lead,
                    lead_status_id: lead.lead_status_id != null ? lead.lead_status_id : 1,
                    // Remove default lead_type_id to allow null values to persist
                }));

                // Sort the leads by modified_date in descending order
                processedLeads.sort((a, b) => {
                    const dateA = new Date(a.post_date);
                    const dateB = new Date(b.post_date);
                    return dateB - dateA; // Descending order
                });

                setLeads(processedLeads);

                const statusesResponse = await axios.get('http://localhost:5000/api/lead-statuses');
                setLeadStatuses(statusesResponse.data);

                const typesResponse = await axios.get('http://localhost:5000/api/lead-types');
                setLeadTypes(typesResponse.data);

                const uniqueCountries = [...new Set(leadsResponse.data.map(lead => lead.country))];
                setCountries(uniqueCountries);

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeadsAndStatuses();
    }, [user, isAdmin, isLoggedIn, navigate]);

    const filteredLeads = leads.filter(lead => {

        const searchMatch =
            (lead.name && lead.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (lead.website && lead.website.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (lead.lead_no != null && lead.lead_no.toString().includes(searchTerm)) ||
            (lead.phone_no && lead.phone_no.toString().includes(searchTerm)) ||
            (lead.cell_no && lead.cell_no.toString().includes(searchTerm)) ||
            (lead.email1 && lead.email1.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (lead.email2 && lead.email2.toLowerCase().includes(searchTerm.toLowerCase()));

        const statusMatch = filterStatus
            ? (typeof lead.lead_status_id === 'number' && lead.lead_status_id.toString() === filterStatus)
            : true;

        const typeMatch = filterType
            ? (lead.lead_type_id != null && lead.lead_type_id === parseInt(filterType, 10))
            : true;

        const countryMatch = filterCountry ? lead.country === filterCountry : true;

        return searchMatch && statusMatch && typeMatch && countryMatch;
    });

    const isFilterActive = useMemo(() => {
        return searchTerm || filterStatus || filterType || filterCountry;
    }, [searchTerm, filterStatus, filterType, filterCountry]);

    const clearFilters = () => {
        setSearchTerm('');
        setFilterStatus('');
        setFilterType('');
        setFilterCountry('');
    };

    const indexOfLastLead = currentPage * leadsPerPage;
    const indexOfFirstLead = indexOfLastLead - leadsPerPage;
    const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);

    const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const getStatusName = (statusId) => {
        const status = leadStatuses.find(s => s.id === statusId);
        return status ? status.name : 'Unknown';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    const handleCheckboxChange = (leadId) => {
        if (selectedLeads.includes(leadId)) {
            setSelectedLeads(selectedLeads.filter(id => id !== leadId));
        } else {
            setSelectedLeads([...selectedLeads, leadId]);
        }
    };

    const handleSelectAllChange = () => {
        if (selectAll) {
            setSelectedLeads([]);
        } else {
            const currentLeadIds = currentLeads.map(lead => lead.id);
            setSelectedLeads(currentLeadIds);
        }
        setSelectAll(!selectAll);
    };

    const handleDeleteSelected = async () => {
        if (window.confirm("Are you sure you want to delete the selected leads?")) {
            try {
                await Promise.all(selectedLeads.map(async (leadId) => {
                    const leadResponse = await axios.get(`http://localhost:5000/api/leads/${leadId}`);
                    const leadData = leadResponse.data;

                    await axios.post('http://localhost:5000/api/leads-archive', leadData);
                    await axios.delete(`http://localhost:5000/api/leads/${leadId}`);
                }));

                setLeads(prevLeads => prevLeads.filter(lead => !selectedLeads.includes(lead.id)));
                setSelectedLeads([]);
                setSelectAll(false);
            } catch (error) {
                console.error('Error deleting leads:', error);
                alert('An error occurred while deleting leads. Please try again.');
            }
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    const renderPagination = () => {
        let paginationContent = [];
        let startPage = Math.max(1, currentPage - 1);
        let endPage = Math.min(totalPages, currentPage + 1);

        if (currentPage > 1) {
            paginationContent.push(
                <div key="prev" className="page-link" onClick={() => paginate(currentPage - 1)}>
                    ⬅
                </div>
            );
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationContent.push(
                <div key={i} className={`page-link ${i === currentPage ? 'active' : ''}`} onClick={() => paginate(i)}>
                    {i}
                </div>
            );
        }

        if (currentPage < totalPages) {
            paginationContent.push(
                <div key="next" className="page-link" onClick={() => paginate(currentPage + 1)}>
                    ➡
                </div>
            );
        }

        return (
            <div className="pagination">
                <div className="pagination-links">
                    {paginationContent}
                </div>
            </div>
        );
    };

    return (
        <div className="leads-container">
            <div className="filter-section">
                <div className="filter-controls">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">All Statuses</option>
                    {leadStatuses.map(status => (
                        <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                    </select>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                    <option value="">All Types</option>
                    {leadTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                </select>
                <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)}>
                    <option value="">All Countries</option>
                    {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                    ))}
                </select>
                <button
                    onClick={clearFilters}
                    className={isFilterActive ? 'clear-filters-active' : ''} // Apply class conditionally
                >
                    Clear Filters
                </button>
                </div>
                <div>
                    <button
                        onClick={handleDeleteSelected}
                        disabled={selectedLeads.length === 0}
                        className={selectedLeads.length > 0 ? 'clear-filters-active' : ''} // Apply class conditionally
                    >
                        Delete Selected
                    </button>
                </div>
            </div>
            {leads.length > 0 ? (
                <>
                    <table>
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={handleSelectAllChange}
                                    />
                                </th>
                                <th>Lead No</th>
                                <th>Name</th>
                                <th>Website</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Country</th>
                                <th>Last Updated</th>
                                <th>Lead Status</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentLeads.map((lead) => (
                                <tr key={lead.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedLeads.includes(lead.id)}
                                            onChange={() => handleCheckboxChange(lead.id)}
                                        />
                                    </td>
                                    <td>
                                        <Link to={`/lead/${lead.id}/${lead.lead_no}`}>{lead.lead_no}</Link>
                                    </td>
                                    <td>{lead.name}</td>
                                    <td>
                                        <a href={lead.website} target="_blank" rel="noopener noreferrer">
                                            {lead.website}
                                        </a>
                                    </td>
                                    <td>{lead.email1}</td>
                                    <td>
                                        {lead.phone_no || lead.cell_no ? (
                                            <>
                                                <BsTelephone icon={faPhone} className="phone-icon" />
                                                {lead.phone_no || lead.cell_no}
                                            </>
                                        ) : (
                                            ' '
                                        )}
                                    </td>
                                    <td>{lead.country}</td>
                                    <td>{formatDate(lead.modified_date)}</td>
                                    <td>{getStatusName(lead.lead_status_id)}</td>
                                    <td>{lead.remarks}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {renderPagination()}
                </>
            ) : (
                <p>No leads found.</p>
            )}
        </div>
    );
}

export default Leads;