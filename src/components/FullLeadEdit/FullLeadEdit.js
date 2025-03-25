import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useParams, useNavigate } from 'react-router-dom';
import './FullLeadEdit.css';

function FullLeadEdit({ onClose, onLeadUpdate }) {
    const { id: leadId } = useParams();
    const navigate = useNavigate();
    const [leadData, setLeadData] = useState({ leadServices: [] });
    const [services, setServices] = useState([]);
    const [hostedOnList, setHostedOnList] = useState([]);
    const { token } = useAuth();
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const dateFormat = "dd/MM/yyyy HH:mm";
    const [leadEarnedByList, setLeadEarnedByList] = useState([]);
    const [isEditingLeadEarnedBy, setIsEditingLeadEarnedBy] = useState(false);
    const [isEditingPostDate, setIsEditingPostDate] = useState(false);
    const [editedLeadEarnedById, setEditedLeadEarnedById] = useState(null);
    const [editedPostDate, setEditedPostDate] = useState(null);

    const handleEditLeadEarnedBy = () => {
        setIsEditingLeadEarnedBy(true);
        setEditedLeadEarnedById(leadData.lead_earned_by_id);
    };

    const handleEditPostDate = () => {
        setIsEditingPostDate(true);
        setEditedPostDate(leadData.post_date ? new Date(leadData.post_date) : null);
    };

    const handleSaveLeadEarnedBy = () => {
        setLeadData({ ...leadData, lead_earned_by_id: editedLeadEarnedById });
        setIsEditingLeadEarnedBy(false);
    };

    const handleSavePostDate = () => {
        setLeadData({ ...leadData, post_date: editedPostDate });
        setIsEditingPostDate(false);
    };

    const handleCancelLeadEarnedBy = () => {
        setIsEditingLeadEarnedBy(false);
    };

    const handleCancelPostDate = () => {
        setIsEditingPostDate(false);
    };

    const handleDateChange = (date, fieldName) => {
        setLeadData((prevData) => ({
            ...prevData,
            [fieldName]: date,
        }));
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'business_closed' && type === 'checkbox') {
            setLeadData((prevData) => ({
                ...prevData,
                [name]: checked,
            }));
        } else if (type === 'checkbox' && name.startsWith('service_')) {
            const serviceId = parseInt(name.split('_')[1], 10);
            setLeadData((prevData) => {
                let updatedServices = prevData.leadServices ? [...prevData.leadServices] : [];
                if (checked) {
                    if (!updatedServices.includes(serviceId)) {
                        updatedServices.push(serviceId);
                    }
                } else {
                    updatedServices = updatedServices.filter(id => id !== serviceId);
                }

                return {
                    ...prevData,
                    leadServices: updatedServices,
                };
            });
        } else {
            setLeadData((prevData) => ({
                ...prevData,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    const fetchLeadData = useCallback(async () => {
        try {
            const leadResponse = await axios.get(`${baseUrl}/api/leads/${leadId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const lead = leadResponse.data;
    
            const servicesResponse = await axios.get(`${baseUrl}/api/lead-services/${leadId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const leadServices = servicesResponse.data;
    
            setLeadData({
                ...lead,
                business_closed: !!lead.business_closed,
                leadServices: leadServices,
            });
        } catch (error) {
            console.error('Error fetching lead data:', error);
        }
    }, [token, baseUrl, leadId]);

    const fetchServices = useCallback(async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/services-availed`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setServices(response.data);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    }, [token, baseUrl]);

    const fetchHostedOnList = useCallback(async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/hosted-on`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setHostedOnList(response.data);
        } catch (error) {
            console.error('Error fetching hosted on list:', error);
        }
    }, [token, baseUrl]);

    const fetchLeadEarnedByList = useCallback(async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/lead-earned-by`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLeadEarnedByList(response.data);
        } catch (error) {
            console.error('Error fetching lead earned by list:', error);
        }
    }, [token, baseUrl]);

    useEffect(() => {
        fetchLeadData();
        fetchServices();
        fetchHostedOnList();
        fetchLeadEarnedByList();
    }, [fetchLeadData, fetchServices, fetchHostedOnList, fetchLeadEarnedByList]);

    const renderServiceSpecificFields = (serviceId) => {
        switch (serviceId) {
            case 1: // SEO
                return (
                    <div className="service-specific-fields-row">
                        <DatePicker
                            selected={leadData.seo_due_date ? new Date(leadData.seo_due_date) : null}
                            onChange={(date) => handleDateChange(date, 'seo_due_date')}
                            dateFormat={dateFormat}
                            placeholderText="SEO Due Date"
                        />
                        <input
                            type="number"
                            name="seo_monthly_payment"
                            value={leadData.seo_monthly_payment || ''}
                            onChange={handleInputChange}
                            placeholder="SEO Payment"
                        />
                    </div>
                );
            case 2: // Hosting
                return (
                    <div className="service-specific-fields-row">
                        <DatePicker
                            selected={leadData.hosting_due_date ? new Date(leadData.hosting_due_date) : null}
                            onChange={(date) => handleDateChange(date, 'hosting_due_date')}
                            dateFormat={dateFormat}
                            placeholderText="Hosting Due Date"
                        />
                        <input
                            type="number"
                            name="hosting_payment"
                            value={leadData.hosting_payment || ''}
                            onChange={handleInputChange}
                            placeholder="Hosting Payment"
                        />
                    </div>
                );
            case 3: // Website Maintenance
                return (
                    <div className="service-specific-fields-row">
                        <DatePicker
                            selected={leadData.website_maintenance_due_date ? new Date(leadData.website_maintenance_due_date) : null}
                            onChange={(date) => handleDateChange(date, 'website_maintenance_due_date')}
                            dateFormat={dateFormat}
                            placeholderText="Website Maintenance Due Date"
                        />
                        <input
                            type="number"
                            name="website_maintenance_payment"
                            value={leadData.website_maintenance_payment || ''}
                            onChange={handleInputChange}
                            placeholder="Website Maintenance Payment"
                        />
                    </div>
                );
            case 5: // Domain
                return (
                    <div className="service-specific-fields-row">
                        <DatePicker
                            selected={leadData.domain_renewal_due_date ? new Date(leadData.domain_renewal_due_date) : null}
                            onChange={(date) => handleDateChange(date, 'domain_renewal_due_date')}
                            dateFormat={dateFormat}
                            placeholderText="Domain Renewal Due Date"
                        />
                        <input
                            type="number"
                            name="domain_payment"
                            value={leadData.domain_payment || ''}
                            onChange={handleInputChange}
                            placeholder="Domain Payment"
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    const renderServiceFields = () => {
        return (
            <div className="service-fields">
                <h4>Service Availed</h4>
                {services.map((service) => (
                    <div key={service.id} className="service-row">
                        <div className="service-row-content">
                            <label>
                                <input
                                    type="checkbox"
                                    name={`service_${service.id}`}
                                    checked={leadData.leadServices?.includes(service.id) || false}
                                    onChange={handleInputChange}
                                />
                                <span className="service-name">{service.name}</span>
                            </label>
                            {leadData.leadServices?.includes(service.id) && renderServiceSpecificFields(service.id)}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const leadDataToUpdate = { ...leadData };
            delete leadDataToUpdate.leadServices;

            await axios.put(`${baseUrl}/api/leads/${leadId}`, leadDataToUpdate, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Update lead services
            await axios.put(`${baseUrl}/api/lead-services/${leadId}`, { services: leadData.leadServices }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            onLeadUpdate();
            navigate(`/lead/${leadId}/${leadData.lead_no}`);
        } catch (error) {
            console.error('Error updating lead:', error);
        }
    };

    return (
        <form className="full-lead-edit-form" onSubmit={handleSubmit}>
            {renderServiceFields()}

            <div className="follow-up-hosted-row">
                <div className="last-follow-ups">
                    <label>Last Follow Up:</label>
                    <DatePicker
                        selected={leadData.last_follow_up ? new Date(leadData.last_follow_up) : null}
                        onChange={(date) => handleDateChange(date, 'last_follow_up')}
                        dateFormat={dateFormat}
                        placeholderText="DD/MM/YYYY"
                    />
                </div>
                <div>
                    <label>Hosted On:</label>
                    <select name="hosted_on_id" value={leadData.hosted_on_id || ''} onChange={handleInputChange}>
                        <option value="">Select Hosted On</option>
                        {hostedOnList.map((hosted) => (
                            <option key={hosted.id} value={hosted.id}>
                                {hosted.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Business Closed:</label>
                    <div className="react-switch-bg">
                        <input
                            type="checkbox"
                            name="business_closed"
                            checked={leadData.business_closed || false}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
            </div>
            <div className="change-post-date">
                <div className="lead-earned-by-page">
                    <label>Lead Earned By:</label>
                    {isEditingLeadEarnedBy ? (
                        <div>
                            <select value={editedLeadEarnedById || ''} onChange={(e) => setEditedLeadEarnedById(parseInt(e.target.value))}>
                                <option value="">Select User</option>
                                {leadEarnedByList.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                            <button type="button" onClick={handleSaveLeadEarnedBy}>Save</button>
                            <button type="button" onClick={handleCancelLeadEarnedBy}>Cancel</button>
                        </div>
                    ) : (
                        <span onClick={handleEditLeadEarnedBy}>
                            {leadEarnedByList && leadData.lead_earned_by_id
                                ? leadEarnedByList.find(user => user.id === leadData.lead_earned_by_id)?.name || 'Not Assigned'
                                : 'Not Assigned'}
                        </span>
                    )}
                </div>
                <div style={{ minWidth: '50%' }}>
                    <label>Post Date:</label>
                    {isEditingPostDate ? (
                        <div>
                            <DatePicker
                                selected={editedPostDate}
                                onChange={(date) => setEditedPostDate(date)}
                                dateFormat={dateFormat}
                                placeholderText="DD/MM/YYYY HH:mm"
                            />
                            <button type="button" onClick={handleSavePostDate}>Save</button>
                            <button type="button" onClick={handleCancelPostDate}>Cancel</button>
                        </div>
                    ) : (
                        <span onClick={handleEditPostDate}>
                            {leadData.post_date
                                ? new Date(leadData.post_date).toLocaleString()
                                : 'Not Set'}
                        </span>
                    )}
                </div>
            </div>

            <div className="button-row">
                <button type="submit">Update Lead</button>
                <button type="button" onClick={() => navigate(`/lead/${leadId}/${leadData.lead_no}`)}>Cancel</button>
            </div>
        </form>
    );
}

export default FullLeadEdit;    