import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LeadForm.css';
import { useAuth } from '../../contexts/AuthContext';

function LeadForm() {
    const [lead_no, setLead_no] = useState('');
    const [name, setName] = useState('');
    const [lead_type_id, setLead_type_id] = useState('');
    const [website, setWebsite] = useState('');
    const [email1, setEmail1] = useState('');
    const [email2, setEmail2] = useState('');
    const [phone_no, setPhone_no] = useState('');
    const [cell_no, setCell_no] = useState('');
    const [lead_status_id, setLead_status_id] = useState('');
    const [country, setCountry] = useState('');
    const [first_response, setFirst_response] = useState('');
    const [remarks, setRemarks] = useState('');
    const [skype_id, setSkype_id] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [value_lead, setValue_lead] = useState(false);
    const [lead_source_id, setLead_source_id] = useState('');
    const [lead_earned_by_id, setLead_earned_by_id] = useState('');

    const [leadTypes, setLeadTypes] = useState([]);
    const [leadStatuses, setLeadStatuses] = useState([]);
    const [leadSources, setLeadSources] = useState([]);
    const [leadEarnedBy, setLeadEarnedBy] = useState([]);
    const [countries, setCountries] = useState([]);
    const [successMessage, setSuccessMessage] = useState(''); // Added success message state

    const { user } = useAuth();

    useEffect(() => {
        const baseUrl = process.env.REACT_APP_API_BASE_URL;
        axios.get(`${baseUrl}/api/lead-types`).then(res => setLeadTypes(res.data));
        axios.get(`${baseUrl}/api/lead-statuses`).then(res => setLeadStatuses(res.data));
        axios.get(`${baseUrl}/api/lead-sources`).then(res => setLeadSources(res.data));
        axios.get(`${baseUrl}/api/lead-earned-by`).then(res => setLeadEarnedBy(res.data));
        axios.get(`${baseUrl}/api/countries`).then(res => setCountries(res.data));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!lead_no || !name || !country) {
            alert("Lead No, Name, and Country are mandatory fields.");
            return;
        }

        console.log("Form Submitted");

        const baseUrl = process.env.REACT_APP_API_BASE_URL;

        axios.post(`${baseUrl}/api/leads`, {
            lead_no,
            name,
            lead_type_id,
            website,
            email1,
            email2,
            phone_no,
            cell_no,
            lead_status_id,
            country: country,
            first_response,
            remarks,
            skype_id,
            whatsapp,
            value_lead,
            lead_source_id,
            lead_earned_by_id,
            author_id: user.id,
        })
        .then((res) => {
            console.log("Lead created:", res.data);
            setLead_no('');
            setName('');
            setLead_type_id('');
            setWebsite('');
            setEmail1('');
            setEmail2('');
            setPhone_no('');
            setCell_no('');
            setLead_status_id('');
            setCountry('');
            setFirst_response('');
            setRemarks('');
            setSkype_id('');
            setWhatsapp('');
            setValue_lead(false);
            setLead_source_id('');
            setLead_earned_by_id('');
            setSuccessMessage('Your lead was successfully submitted for approval.'); // Set success message
            setTimeout(() => setSuccessMessage(''), 5000); // Clear message after 5 seconds
        })
        .catch((err) => {
            console.error("Error creating lead:", err);
            setSuccessMessage('Error submitting lead. Please try again.'); // Optionally add error message
            setTimeout(() => setSuccessMessage(''), 5000);
        });
    };

    return (
        <div className="lead-form-container">

        
        <form className="lead-form" onSubmit={handleSubmit}>
            <h2>Create Lead</h2>
            <div className="main-form-row">
                <div className="form-row">
                    <label>Lead No: *</label>
                    <input type="text" value={lead_no} onChange={(e) => setLead_no(e.target.value)} required />
                </div>
                <div className="form-row">
                <label>Lead Type:</label>
                <select value={lead_type_id} onChange={(e) => setLead_type_id(e.target.value)}>
                    <option value="">Select Lead Type</option>
                    {leadTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                </select>
                </div>
                <div className="form-row">
                <label>Lead Status:</label>
                <select value={lead_status_id} onChange={(e) => setLead_status_id(e.target.value)}>
                    <option value="">Select Lead Status</option>
                    {leadStatuses.map(status => (
                        <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                </select>
                </div>
            </div>
            <div className="main-form-row">
                <div className="form-row">
                    <label>Name: *</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-row">
                <label>Country: *</label>
                <select value={country} onChange={(e) => setCountry(e.target.value)} required>
                    <option value="">Select Country</option>
                    {countries.map(country => (
                        <option key={country.code} value={country.name}>{country.name}</option>
                    ))}
                </select>
                </div>
                <div className="form-row">
                <label>Lead Source:</label>
                <select value={lead_source_id} onChange={(e) => setLead_source_id(e.target.value)}>
                    <option value="">Select Lead Source</option>
                    {leadSources.map(source => (
                        <option key={source.id} value={source.id}>{source.name}</option>
                    ))}
                </select>
                </div>
            </div>
            <div className="main-form-row-2">
                <div className="form-row">
                    <label>Website:</label>
                    <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </div>
                <div className="form-row">
                <label>Email 1:</label>
                <input type="email" value={email1} onChange={(e) => setEmail1(e.target.value)} />
                </div>
            </div>

            <div className="main-form-row-2">
                <div className="form-row">
                <label>Phone No:</label>
                <input type="tel" value={phone_no} onChange={(e) => setPhone_no(e.target.value)} />
                </div>
                <div className="form-row">
                <label>Email 2:</label>
                <input type="email" value={email2} onChange={(e) => setEmail2(e.target.value)} />
                </div>
            </div>

            <div className="main-form-row">
            <div className="form-row">
                <label>Cell No:</label>
                <input type="tel" value={cell_no} onChange={(e) => setCell_no(e.target.value)} />
            </div>
            <div className="form-row">
                <label>WhatsApp:</label>
                <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            </div>
            <div className="form-row">
                <label>Skype Id:</label>
                <input type="text" value={skype_id} onChange={(e) => setSkype_id(e.target.value)} />
            </div>
            </div>

            <div className="main-form-row">

            <div className="form-row">
                <label>Lead Earned By:</label>
                <select value={lead_earned_by_id} onChange={(e) => setLead_earned_by_id(e.target.value)}>
                    <option value="">Select Lead Earned By</option>
                    {leadEarnedBy.map(earnedBy => (
                        <option key={earnedBy.id} value={earnedBy.id}>{earnedBy.name}</option>
                    ))}
                </select>
            </div>
            <div className="form-row">
                <label>Value Lead:</label>
                <input type="checkbox" checked={value_lead} onChange={(e) => setValue_lead(e.target.checked)} />
            </div>
            </div>

           
            <div className="form-row">
                <label>First Response:</label>
                <textarea value={first_response} onChange={(e) => setFirst_response(e.target.value)} />
            </div>

            

            
            <div className="form-row">
                <label>Remarks:</label>
                <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </div>
            <div className="form-row">
            <button type="submit">Create Lead</button>
            </div>
            {successMessage && <div className="success-message">{successMessage}</div>} {/* Display success message */}
        </form>

        </div>
    );
}

export default LeadForm;