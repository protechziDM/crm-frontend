import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaCheck, FaTimes, FaRegCheckCircle, FaPen, FaMapMarkerAlt } from 'react-icons/fa';
import { BsCopy, BsCheck2Circle, BsChevronRight } from "react-icons/bs";
import './LeadDisplay.css';
import { useAuth } from '../../contexts/AuthContext';
import Notes from '../Notes/Notes';
import DateFormat from '../DateFormat/DateFormat';
import PaymentForm from '../PaymentForm/PaymentForm'; // For adding payments
import PaymentEdit from '../PaymentForm/PaymentEdit';
import { Button } from '@mui/material';
import PaymentForLead from '../PaymentForLead/PaymentForLead';

function LeadDisplay() {
    const params = useParams();
    const { id, leadNo } = params;
    const [lead, setLead] = useState(null);
    const [leads, setLeads] = useState([]);
    const [leadTypes, setLeadTypes] = useState([]);
    const [leadStatuses, setLeadStatuses] = useState([]);
    const [leadSources, setLeadSources] = useState([]);
    const [editingFields, setEditingFields] = useState({});
    const navigate = useNavigate();
    const originalValues = useRef({});
    const [countries, setCountries] = useState([]);
    const [showTick, setShowTick] = useState(false);
    const [copiedTick, setCopiedTick] = useState(null);
    const [authors, setAuthors] = useState([]);
    const { user, isLoggedIn, isAdmin } = useAuth();
    const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
    const [isEditPaymentFormOpen, setIsEditPaymentFormOpen] = useState(false);
    const [paymentToEdit, setPaymentToEdit] = useState(null);
    const [addPaymentSuccessMessage, setAddPaymentSuccessMessage] = useState('');
    const [refreshPayments, setRefreshPayments] = useState(0);

    const handleOpenPaymentForm = () => {
        setIsPaymentFormOpen(true);
        setAddPaymentSuccessMessage(''); // Reset success message when opening the modal
    };

    const handleClosePaymentForm = () => {
        setIsPaymentFormOpen(false);
        setIsEditPaymentFormOpen(false);
        setPaymentToEdit(null);
        setAddPaymentSuccessMessage(''); // Reset success message when closing the modal
    };

    const handlePaymentSubmit = async () => {
        try {
            const updatedLeadResponse = await axios.get(`http://localhost:5000/api/leads/${lead.id}`);
            setLead(updatedLeadResponse.data);
            setAddPaymentSuccessMessage("Payment added successfully!");
            setRefreshPayments(prev => prev + 1); // Trigger refresh here
        } catch (error) {
            console.error("Error updating lead payments:", error);
        }
    };

    const handleEditPayment = (payment) => {
        setPaymentToEdit(payment);
        setIsEditPaymentFormOpen(true);
    };

    const handleCopyClick = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedTick(field);
        setTimeout(() => setCopiedTick(null), 1000);
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!isLoggedIn()) {
                navigate('/login');
                return;
            }

            if (!user) {
                setLead(null);
                return;
            }

            try {
                await Promise.all([
                    fetchLeads(),
                    fetchLeadTypes(),
                    fetchLeadStatuses(),
                    fetchLeadSources(),
                    fetchCountries(),
                    fetchAuthors()
                ]);

            } catch (error) {
                console.error('Error in fetchData:', error);
                setLead(null);
            }
        };

        const fetchLeads = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/leads');
                let allLeads = response.data;

                const authorizedLeads = allLeads.filter(lead => {
                    if (isAdmin()) {
                        return true;
                    }
                    return lead.author_id === user.id;
                });

                authorizedLeads.sort((a, b) => a.id - b.id);
                setLeads(authorizedLeads);
            } catch (error) {
                console.error('Error fetching leads:', error);
            }
        };

        const fetchLeadTypes = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/lead-types');
                setLeadTypes(response.data);
            } catch (error) {
                console.error('Error fetching lead types:', error);
            }
        };

        const fetchLeadStatuses = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/lead-statuses');
                setLeadStatuses(response.data);
            } catch (error) {
                console.error('Error fetching lead statuses:', error);
            }
        };

        const fetchLeadSources = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/lead-sources');
                setLeadSources(response.data);
            } catch (error) {
                console.error('Error fetching lead sources:', error);
            }
        };

        const fetchCountries = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/countries');
                setCountries(response.data);
            } catch (error) {
                console.error('Error fetching countries:', error);
            }
        };

        const fetchAuthors = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/users');
                setAuthors(response.data);
            } catch (error) {
                console.error('Error fetching authors:', error);
            }
        };

        fetchData();
    }, [id, isAdmin, user, isLoggedIn, navigate]);

    useEffect(() => {
        const fetchLeadData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/leads/${id}`);
                const foundLead = response.data;

                if (!foundLead) {
                    setLead(null);
                    return;
                }

                const isLeadInAuthorizedLeads = leads.some(leadItem => leadItem.id === parseInt(id));

                if (isLeadInAuthorizedLeads) {
                    setLead(foundLead);
                } else {
                    setLead(null);
                }
            } catch (error) {
                setLead(null);
            }
        };

        if (leads.length > 0) {
            fetchLeadData();
        }
    }, [id, leads]);

    const handlePrevious = () => {
        const currentLeadIndex = leads.findIndex(leadItem => leadItem.id === parseInt(id));
        if (currentLeadIndex > 0) {
            const previousLead = leads[currentLeadIndex - 1];
            navigate(`/lead/${previousLead.id}/${previousLead.lead_no}`);
        }
    };
    
    const handleNext = () => {
        const currentLeadIndex = leads.findIndex(leadItem => leadItem.id === parseInt(id));
        if (currentLeadIndex < leads.length - 1) {
            const nextLead = leads[currentLeadIndex + 1];
            navigate(`/lead/${nextLead.id}/${nextLead.lead_no}`);
        }
    };

    if (!lead) {
        return <div>No lead found associated to your account!</div>;
    }

    const getFirstLetter = (name) => {
        if (!name) return '';
        return name.charAt(0).toUpperCase();
    };

    const getLeadTypeName = (id) => {
        const leadType = leadTypes.find((type) => type.id === id);
        return leadType ? leadType.name : id;
    };

    const getLeadStatusName = (id) => {
        const leadStatus = leadStatuses.find((status) => status.id === id);
        return leadStatus ? leadStatus.name : id;
    };

    const getLeadSourceName = (id) => {
        const leadSource = leadSources.find((source) => source.id === id);
        return leadSource ? leadSource.name : id;
    };

    const getAuthorName = (id) => { // Add getAuthorName function
        const author = authors.find((a) => a.id === id);
        return author ? author.name : id;
    };  

    const handleFieldChange = (field, value) => {
        setLead({ ...lead, [field]: value });
    };

    const handleEditClick = (field) => {
        if (field === 'author_id' && !isAdmin()) {
            return; // Prevent non-admins from editing Lead Owner
        }
        //if (!isAdmin()) return; // Prevent editing if not admin
        originalValues.current[field] = lead[field];
        setEditingFields({ ...editingFields, [field]: true });
    };

    const handleNavigateToFullLeadEdit = () => {
        navigate(`/lead/${lead.id}/edit`);
    };

    const handleCancelEdit = (field) => {
        handleFieldChange(field, originalValues.current[field]);
        setEditingFields({ ...editingFields, [field]: false });
    };

    const handleSaveClick = async (field) => {
        setEditingFields({ ...editingFields, [field]: false });
        try {
            if (!lead.id) {
                console.error("Lead ID is missing. Cannot update.");
                return;
            }
            await axios.put(`http://localhost:5000/api/leads/${lead.id}`, { [field]: lead[field] });
    
            // Update the lead state directly
            setLead({ ...lead, [field]: lead[field]});
    
            // Fetch the updated lead data from the server
            const updatedLeadResponse = await axios.get(`http://localhost:5000/api/leads/${lead.id}`);
            setLead(updatedLeadResponse.data);
    
            setShowTick(true);
            setTimeout(() => setShowTick(false), 1000);
        } catch (error) {
            console.error('Error updating lead:', error);
            if (error.response) {
                console.error('Server response:', error.response.data);
            }
        }
    };

    const renderEditableField = (field, label, displayValue) => {
        const copyFields = ['name', 'email1', 'phone_no', 'cell_no', 'lead_no', 'email2'];

        if (editingFields[field]) {
            if (field === 'first_response' || field === 'remarks') {
                if (editingFields[field]) {
                    return (
                        <div className="block-fr">
                            <h3>{label} :</h3>
                            <textarea
                                value={lead[field] || ''}
                                onChange={(e) => handleFieldChange(field, e.target.value)}
                            />
                            <BsCheck2Circle onClick={() => handleSaveClick(field)} style={{ color: 'green', fontSize: '23px', cursor: 'pointer' }} />
                            <FaTimes onClick={() => handleCancelEdit(field)} style={{ color: 'red', fontSize: '23px', cursor: 'pointer' }} />
                            {showTick && <FaCheck style={{ color: 'green' }} />}
                        </div>
                    );
                } else {
                    return (
                        <div className="block" style={{ position: 'relative' }}>
                            <h3>{label}</h3>
                            <p
                                onClick={() => handleEditClick(field)}
                                style={{
                                    minHeight: '20px',
                                    cursor: 'pointer',
                                    padding: '5px',
                                }}
                            >
                                {displayValue || 'Click to add'}
                            </p>
                            {isAdmin && (
                                <FaPen
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditClick(field);
                                    }}
                                    className="edit-icon"
                                    style={{
                                        cursor: 'pointer',
                                        position: 'absolute',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        right: '-10px',
                                        fontSize: '0.7em',
                                        marginTop: '0px',
                                        color: '#c3bdbd',
                                    }}
                                />
                            )}
                        </div>
                    );
                }
            } else if (field === 'follow_up' || field === 'value_lead') {
                return (
                    <div className="block">
                        <h3>{label} :</h3>
                        <input
                            type="checkbox"
                            checked={lead[field] === 1} // Assuming 1 means checked
                            onChange={(e) => handleFieldChange(field, e.target.checked ? 1 : 0)}
                        />
                        <BsCheck2Circle onClick={() => handleSaveClick(field)} style={{ color: 'green', fontSize: '23px', cursor: 'pointer' }} />
                        <FaTimes onClick={() => handleCancelEdit(field)} style={{ color: 'red', fontSize: '23px', cursor: 'pointer' }} />
                        {showTick && <FaCheck style={{ color: 'green' }} />}
                    </div>
                );
            } else {
                return (
                    <div className="block">
                        <h3>{label} :</h3>
                        <input
                            type="text"
                            value={lead[field] || ''}
                            onChange={(e) => handleFieldChange(field, e.target.value)}
                        />
                        <FaRegCheckCircle onClick={() => handleSaveClick(field)} style={{ color: 'green', fontSize: '23px', cursor: 'pointer' }} />
                        <FaTimes onClick={() => handleCancelEdit(field)} style={{ color: 'red', fontSize: '23px', cursor: 'pointer' }} />
                        {showTick && <FaCheck style={{ color: 'green' }} />}
                    </div>
                );
            }
        } else if (field === 'lead_no') {
            return (
                <div className="block" style={{ position: 'relative' }}>
                    <h3>{label} :</h3>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <p onClick={() => handleCopyClick(displayValue, field)}>{displayValue}</p>
                        {copiedTick === field && (
                            <div // Wrap FaCheck in a div
                                ref={(el) => {
                                    if (el) {
                                        setTimeout(() => el.firstChild.classList.add('show'), 10); // Target the first child
                                    }
                                }}
                            >
                                <FaCheck
                                    className="copied-tick"
                                    style={{ color: 'green', fontSize: '0.8em', marginLeft: '5px' }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            );
        } else if (copyFields.includes(field)) {
            return (
                <div className="block" style={{ position: 'relative' }}>
                    <h3>{label} :</h3>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {field === 'name' ? (
                            <strong style={{ fontWeight: 'bold' }}>
                                <p style={{ display: 'inline' }} onClick={() => handleCopyClick(displayValue, field)}>
                                    {displayValue}
                                </p>
                            </strong>
                        ) : (
                            <p onClick={() => handleCopyClick(displayValue, field)}>{displayValue}</p>
                        )}
                        {copiedTick === field && (
                            <div
                                ref={(el) => {
                                    if (el) {
                                        setTimeout(() => el.firstChild.classList.add('show'), 10);
                                    }
                                }}
                            >
                                <FaCheck
                                    className="copied-tick"
                                    style={{ color: 'green', fontSize: '0.8em', marginLeft: '5px' }}
                                />
                            </div>
                        )}
                    </div>
                    {isAdmin && <FaPen
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(field);
                        }}
                        className="edit-icon"
                        style={{
                            cursor: 'pointer',
                            position: 'absolute',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            right: '-10px',
                            fontSize: '0.7em',
                            marginTop: '6px',
                            color: '#c3bdbd',
                        }}
                    />}
                </div>
            );
        } else if (field === 'website') {
            return (
                <div className="block" style={{ position: 'relative' }}>
                    <h3>{label} :</h3>
                    <a href={`http://${displayValue}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'Poppins', textDecoration: 'none' }}>
                        {displayValue}
                    </a>
                    <BsCopy onClick={() => handleCopyClick(displayValue, 'website')} style={{ color: '#b7b3b3', cursor: 'pointer', marginLeft: '5px' }} />
                    {copiedTick === 'website' && (
                        <div
                            ref={(el) => {
                                if (el) {
                                    setTimeout(() => el.firstChild.classList.add('show'), 10);
                                }
                            }}
                        >
                            <FaCheck
                                className="copied-tick"
                                style={{ color: 'green', fontSize: '0.8em', marginLeft: '5px' }}
                            />
                        </div>
                    )}
                    {isAdmin && <FaPen
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(field);
                        }}
                        className="edit-icon"
                        style={{
                            cursor: 'pointer',
                            position: 'absolute',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            right: '-10px',
                            fontSize: '0.7em',
                            marginTop: '0px',
                            color: '#c3bdbd',
                        }}
                    />}
                </div>
            );
        } else if (field === 'first_response' || field === 'remarks') {
            return (
                <div className="block" style={{ position: 'relative' }}>
                <h3>{label} :</h3>
                <p
                    onClick={() => handleEditClick(field)}
                    style={{
                        minHeight: '20px',
                        cursor: 'pointer',
                        padding: '5px', // Added padding to make it easier to click
                    }}
                >
                    {displayValue || 'Click to add'}
                </p>
                {isAdmin && (
                    <FaPen
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(field);
                        }}
                        className="edit-icon"
                        style={{
                            cursor: 'pointer',
                            position: 'absolute',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            right: '-10px',
                            fontSize: '0.2em',
                            marginTop: '0px',
                            color: '#c3bdbd',
                        }}
                    />
                )}
            </div>
            );
        } else if (field === 'follow_up' || field === 'value_lead') {
            return (
                <div className="block">
                    <h3>{label} :</h3>
                    <p onClick={() => handleEditClick(field)}>
                        {lead[field] === 1 ? 'Yes' : 'No'}
                    </p>
                </div>
            );
        } else {
            return (
                <div className="block" style={{ position: 'relative' }}>
                <h3>{label} :</h3>
                <p>{displayValue}</p>
                {isAdmin && (
                    <FaPen
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(field);
                        }}
                        className="edit-icon"
                        style={{
                            cursor: 'pointer',
                            position: 'absolute',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            right: '-10px',
                            fontSize: '0.7em',
                            marginTop: '0px',
                            color: '#c3bdbd',
                        }}
                    />
                )}
            </div>
            );
        }
    };

    const renderSelectField = (field, label, displayValue, options, getValueName) => {
        if (editingFields[field]) {
            return (
                <div className="block">
                    <h3>{label} :</h3>
                    <select
                        value={lead[field] || ''}
                        onChange={(e) => handleFieldChange(field, e.target.value)}
                    >
                        <option value="">Select</option>
                        {options.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                    <FaRegCheckCircle onClick={() => handleSaveClick(field)} style={{ color: 'green', fontSize: '23px', cursor: 'pointer' }} />
                    <FaTimes onClick={() => handleCancelEdit(field)} style={{ color: 'red', fontSize: '23px', cursor: 'pointer' }} />
                    {showTick && <FaCheck style={{ color: 'green' }} />}
                </div>
            );
        } else {
            return (
                <div className="block">
                    <h3>{label} :</h3>
                    <p
                        onClick={() => handleEditClick(field)}
                        style={{
                            minHeight: '20px',
                            cursor: 'pointer',
                            padding: '5px',
                        }}
                    >
                        {displayValue || 'Click to select'}
                    </p>
                </div>
            );
        }
    };

    const renderCountryField = () => {
        if (editingFields['country']) {
            return (
                <div className="block">
                    <h3>Country :</h3>
                    <select value={lead['country'] || ''} onChange={(e) => handleFieldChange('country', e.target.value)}>
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                            <option key={country.code} value={country.name}>
                                {country.name}
                            </option>
                        ))}
                    </select>
                    <FaRegCheckCircle onClick={() => handleSaveClick('country')} style={{ color: 'green', fontSize: '23px', cursor: 'pointer' }} />
                    <FaTimes onClick={() => handleCancelEdit('country')} style={{ color: 'red', fontSize: '23px', cursor: 'pointer' }} />
                    {showTick && <FaCheck style={{ color: 'green' }} />}
                </div>
            );
        } else {
            const country = countries.find((c) => c.code === lead.country);
            const countryName = country ? country.name : lead.country;
            return (
                <div className="block">
                    <h3>Country :</h3>
                    <p
                        onClick={() => handleEditClick('country')}
                        style={{
                            minHeight: '20px',
                            cursor: 'pointer',
                            padding: '5px',
                        }}
                    >
                        {countryName || 'Click to select'}
                    </p>
                </div>
            );
        }
    };

    const renderLeadOwnerField = () => { // Add renderLeadOwnerField
        if (editingFields['author_id']) {
            return (
                <div className="block">
                    <h3>Lead Owner :</h3>
                    <select
                        value={lead['author_id'] || ''}
                        onChange={(e) => handleFieldChange('author_id', e.target.value)}
                    >
                        <option value="">Select Lead Owner</option>
                        {authors.map((author) => (
                            <option key={author.id} value={author.id}>
                                {author.name}
                            </option>
                        ))}
                    </select>
                    <FaRegCheckCircle onClick={() => handleSaveClick('author_id')} style={{ color: 'green', fontSize: '23px', cursor: 'pointer' }} />
                    <FaTimes onClick={() => handleCancelEdit('author_id')} style={{ color: 'red', fontSize: '23px', cursor: 'pointer' }} />
                    {showTick && <FaCheck style={{ color: 'green' }} />}
                </div>
            );
        } else {
            const authorName = getAuthorName(lead.author_id);
            return (
                <div className="block">
                    <h3>Lead Owner :</h3>
                    <p onClick={() => handleEditClick('author_id')}>{authorName}</p>
                </div>
            );
        }
    };

    return (
        <>
            <div className="top-bar">
                <div className="breadcrumb">
                    <Link to="/">Home</Link> <BsChevronRight style={{ marginBottom: '-4px', fontSize: '15px' }} /> <Link to="/leads">Leads</Link> <BsChevronRight style={{ marginBottom: '-4px', fontSize: '15px' }} /> <span className='nav-lead'>{lead.lead_no}</span>
                </div>
                <div className="navigation-container">
                    <Button variant="contained" onClick={handleNavigateToFullLeadEdit} className="clean-btn">Edit Lead</Button>
                    <Button variant="contained" onClick={handleOpenPaymentForm} className="clean-btn">Add Payment</Button>
                    <button onClick={handlePrevious} disabled={leads.findIndex((l) => l.lead_no === leadNo) === 0} className="pre-net-btn">
                        ⬅
                    </button>
                    <button onClick={handleNext} disabled={leads.findIndex((l) => l.lead_no === leadNo) === leads.length - 1} className="pre-net-btn">
                        ➡
                    </button>
                </div>
            </div>
            <PaymentForm
                leadId={lead.id}
                isOpen={isPaymentFormOpen && !isEditPaymentFormOpen} // Only open if not in edit mode
                onClose={handleClosePaymentForm}
                onPaymentSubmit={handlePaymentSubmit}
                successMessage={addPaymentSuccessMessage}
            />

            {/* Edit Payment Form */}
            {paymentToEdit && (
                <PaymentEdit
                    paymentData={paymentToEdit}
                    isOpen={isEditPaymentFormOpen}
                    onClose={handleClosePaymentForm}
                    onPaymentSubmit={handlePaymentSubmit}
                />
            )}

            <div className="main-section-lead">
                <div className="lead-display-main">
                    <div className="name-section">
                        <div className="first-letter">{getFirstLetter(lead.name)}</div>
                        <div className="name-and-country">
                            <h1>{lead.name}</h1>
                            <h4>
                                <FaMapMarkerAlt style={{ color: '#a79f9f', marginRight: '5px' }} />
                                {countries.find((c) => c.code === lead.country)?.name || lead.country}
                            </h4>
                        </div>
                    </div>
                    <div className="divider"></div>
                    <div className="section">
                        <div className="column-1">
                            {renderEditableField('name', 'Lead Name', lead.name)}
                            {renderEditableField('website', 'Website', lead.website)}
                            {renderEditableField('email1', 'Email', lead.email1)}
                            {renderEditableField('phone_no', 'Phone', lead.phone_no)}
                            {renderEditableField('cell_no', 'Mobile', lead.cell_no)}
                        </div>
                        <div className="column-2">
                            {renderEditableField('lead_no', 'Lead No', lead.lead_no)}
                            {renderSelectField('lead_type_id', 'Lead Type', getLeadTypeName(lead.lead_type_id), leadTypes, getLeadTypeName)}
                            {renderSelectField('lead_status_id', 'Lead Status', getLeadStatusName(lead.lead_status_id), leadStatuses, getLeadStatusName)}
                            {renderCountryField()}
                            {renderSelectField('lead_source_id', 'Lead Source', getLeadSourceName(lead.lead_source_id), leadSources, getLeadSourceName)}
                        </div>
                    </div>

                    <div className="divider"></div>

                    <div className="section">
                        <div className="column-1">
                            {renderLeadOwnerField()} {/* Use renderLeadOwnerField */}
                            <div className="block">
                                <h3>Created On :</h3>
                                <p><DateFormat dateString={lead.post_date} format="date_only" /></p>
                            </div>
                            <div className="block">
                                <h3>Modified On :</h3>
                                <p><DateFormat dateString={lead.modified_date} format="date_only" /></p>
                            </div>
                            {renderEditableField('follow_up', 'Need Reminder', lead.follow_up)}
                        </div>
                        <div className="column-2">
                            {renderEditableField('email2', '2nd Email', lead.email2)}
                            {renderEditableField('skype_id', 'Skype ID', lead.skype_id)}
                            {renderEditableField('whatsapp', 'Whatsapp', lead.whatsapp)}
                            {renderEditableField('value_lead', 'Value Lead ?', lead.value_lead)}
                        </div>
                    </div>

                    <div className="divider"></div>
                    <div className="fr-section">
                        {renderEditableField('first_response', 'First Response', lead.first_response)}
                        {renderEditableField('remarks', 'Remarks', lead.remarks)}
                    </div>
                    <div className="divider"></div>
                    {lead.lead_status_id === 6 && ( // Conditional rendering here
                        <div className="payment-section">
                            <PaymentForLead
                                leadId={lead.id}
                                onEditPayment={handleEditPayment}
                                refreshPayments={refreshPayments}
                            />
                        </div>
                    )}
                </div>

                <div className="note-section">
                    <h3>Communication history</h3>
                    {lead && <Notes leadId={lead.id} currentUserId={user.id} />}
                </div>
            </div>
        </>
    );
}

export default LeadDisplay;