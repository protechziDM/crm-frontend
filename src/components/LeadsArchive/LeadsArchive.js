import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Leads/Leads.css';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';

function LeadsArchive() {
    const [leads, setLeads] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const leadsPerPage = 30;
    const { user, isAdmin, isLoggedIn } = useAuth();
    const [leadStatuses, setLeadStatuses] = useState([]);
    const navigate = useNavigate();
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(true);
    const [action, setAction] = useState('delete');

    useEffect(() => {
        const fetchLeadsAndStatuses = async () => {
            if (!isLoggedIn()) {
                navigate('/login');
                return;
            }

            setLoading(true);
            try {
                let url = 'http://localhost:5000/api/leads-archive';
                const leadsResponse = await axios.get(url);
                setLeads(leadsResponse.data);

                const statusesResponse = await axios.get('http://localhost:5000/api/lead-statuses');
                setLeadStatuses(statusesResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeadsAndStatuses();
    }, [user, isAdmin, isLoggedIn, navigate]);

    const indexOfLastLead = currentPage * leadsPerPage;
    const indexOfFirstLead = indexOfLastLead - leadsPerPage;
    const currentLeads = leads.slice(indexOfFirstLead, indexOfLastLead);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(leads.length / leadsPerPage); i++) {
        pageNumbers.push(i);
    }

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

    const handleAction = async () => {
        if (selectedLeads.length === 0) return;

        const confirmationMessage = `Are you sure you want to ${action} ${selectedLeads.length} leads?`;
        if (!window.confirm(confirmationMessage)) return;

        try {
            if (action === 'delete' || action === 'restore') {
                await Promise.all(selectedLeads.map(async (leadId) => {
                    try {
                        if (action === 'delete') {
                            await axios.delete(`http://localhost:5000/api/leads-archive/${leadId}`);
                        } else if (action === 'restore') {
                            const leadsResponse = await axios.get('http://localhost:5000/api/leads-archive');
                            const archivedLeads = leadsResponse.data;
                            const leadToRestore = archivedLeads.find(lead => lead.id === leadId);

                            if (leadToRestore) {
                                await axios.post('http://localhost:5000/api/leads', leadToRestore);
                                await axios.delete(`http://localhost:5000/api/leads-archive/${leadId}`);
                            } else {
                                console.warn(`Lead ${leadId} not found in archive.`);
                                alert(`Lead ${leadId} not found in archive.`);
                            }
                        }
                    } catch (leadError) {
                        console.error(`Error ${action}ing lead ${leadId}:`, leadError);
                        alert(`Failed to ${action} lead ${leadId}.`);
                    }
                }));
            }

            setLeads(prevLeads => prevLeads.filter(lead => !selectedLeads.includes(lead.id)));
            setSelectedLeads([]);
            setSelectAll(false);
        } catch (error) {
            console.error(`Error ${action} leads:`, error);
            alert(`An error occurred while ${action}ing leads. Please try again.`);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="leads-container">
            <h2>Deleted Leads : </h2>
            {leads.length > 0 ? (
                <>
                    <div style={{ marginTop: '20px' }} className="archive-delete-btn">
                        <select value={action} onChange={(e) => setAction(e.target.value)}>
                            <option value="delete">Delete</option>
                            <option value="restore">Restore</option>
                        </select>
                        <button
                            onClick={handleAction}
                            disabled={selectedLeads.length === 0}
                            className={selectedLeads.length > 0 ? 'clear-filters-active' : ''}
                        >
                            {action === 'delete' ? 'Delete Selected' : 'Restore Selected'}
                        </button>
                    </div>
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
                                <th>Phone/Cell</th>
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
                                                <FontAwesomeIcon icon={faPhone} className="phone-icon" />
                                                {lead.phone_no || lead.cell_no}
                                            </>
                                        ) : (
                                            'N/A'
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
                    <ul className="pagination">
                        {pageNumbers.map((number) => (
                            <li key={number} className="page-item">
                                <button onClick={() => paginate(number)} className="page-link">
                                    {number}
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            ) : (
                <p>No leads found in archive.</p>
            )}
        </div>
    );
}

export default LeadsArchive;