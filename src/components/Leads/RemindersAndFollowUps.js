import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Leads.css';
import './RemindersAndFollowUps.css';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

function RemindersAndFollowUps() {
    const [leads, setLeads] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const leadsPerPage = 30;
    const { user, isAdmin, isLoggedIn } = useAuth();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLeads = async () => {
            if (!isLoggedIn()) {
                navigate('/login');
                return;
            }

            setLoading(true);
            try {
                let url = `${baseUrl}/api/leads`;
                if (!isAdmin() && user) {
                    url += `/user/${user.id}`;
                }

                const leadsResponse = await axios.get(url);
                let processedLeads = leadsResponse.data
                    .filter(lead => lead.follow_up === 1)
                    .map(lead => ({
                        ...lead,
                        lead_status_id: lead.lead_status_id != null ? lead.lead_status_id : 1,
                    }));

                processedLeads.sort((a, b) => {
                    const dateA = new Date(a.post_date);
                    const dateB = new Date(b.post_date);
                    return dateB - dateA;
                });

                setLeads(processedLeads);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeads();
    }, [user, isAdmin, isLoggedIn, navigate, baseUrl]);

    const filteredLeads = leads.filter(lead => {
        const searchMatch =
            (lead.name && lead.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (lead.lead_no != null && lead.lead_no.toString().includes(searchTerm)) ||
            (lead.remarks && lead.remarks.toLowerCase().includes(searchTerm.toLowerCase()));

        return searchMatch;
    });

    const indexOfLastLead = currentPage * leadsPerPage;
    const indexOfFirstLead = indexOfLastLead - leadsPerPage;
    const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);

    const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    const renderPagination = () => {
        if (totalPages <= 1) {
            return null;
        }

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
        <div className="leads-container-re">
            <div className="filter-section" style={{ margin: '0', top: '0' }}>
                <h4 style={{ margin: '0' }}>Reminders & Follow Ups</h4>
                <div className="filter-controls">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            {leads.length > 0 ? (
                <>
                    <table className="remind-rr">
                        <thead>
                            <tr>
                                <th>Lead No</th>
                                <th>Name</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentLeads.map((lead) => (
                                <tr key={lead.id}>
                                    <td>
                                        <Link to={`/lead/${lead.id}/${lead.lead_no}`}>{lead.lead_no}</Link>
                                    </td>
                                    <td>{lead.name}</td>
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

export default RemindersAndFollowUps;
