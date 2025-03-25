import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './SeoPayment.css'; // Use the same CSS file
import { useAuth } from '../../contexts/AuthContext';
import DateFormat from '../DateFormat/DateFormat';
import PaymentForm from '../PaymentForm/PaymentForm';
import { FaPlus, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Maintenance() {
    const [maintenanceLeads, setMaintenanceLeads] = useState([]);
    const [maintenancePayments, setMaintenancePayments] = useState({});
    const [editingDueDate, setEditingDueDate] = useState(null);
    const [dueDateValue, setDueDateValue] = useState('');
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [selectedLeadId, setSelectedLeadId] = useState(null);
    const { token, user } = useAuth();
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [totalMaintenancePayment, setTotalMaintenancePayment] = useState(0);
    const [totalMonthlyPayment, setTotalMonthlyPayment] = useState(0);

    const fetchMaintenanceLeads = useCallback(async () => {
        try {
            const leadsResponse = await axios.get(`${baseUrl}/api/leads`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const leads = leadsResponse.data;

            const leadServicesResponse = await axios.get(`${baseUrl}/api/lead-services`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const allLeadServices = leadServicesResponse.data;

            const maintenanceLeadIds = allLeadServices
                .filter(service => service.service_id === 3) // Changed to service_id 3 (Maintenance)
                .map(service => service.lead_id);

            const maintenanceLeadsData = leads.filter(lead => maintenanceLeadIds.includes(lead.id));

            maintenanceLeadsData.sort((a, b) => new Date(a.website_maintenance_due_date) - new Date(b.website_maintenance_due_date)); // Changed to website_maintenance_due_date

            setMaintenanceLeads(maintenanceLeadsData);
        } catch (error) {
            console.error('Error fetching Maintenance leads:', error);
        }
    }, [baseUrl, token]);

    const fetchMaintenancePayments = useCallback(async (leadId) => {
        try {
            const paymentsResponse = await axios.get(`${baseUrl}/api/payments/lead/${leadId}`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { status: 'active' },
            });
            let payments = paymentsResponse.data.filter(payment => payment.payment_type_id === 4); // Changed to payment_type_id 4 (Maintenance)

            payments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setMaintenancePayments(prevPayments => ({
                ...prevPayments,
                [leadId]: payments,
            }));
        } catch (error) {
            console.error(`Error fetching Maintenance payments for lead ${leadId}:`, error);
        }
    }, [baseUrl, token]);

    useEffect(() => {
        fetchMaintenanceLeads();
    }, [fetchMaintenanceLeads]);

    useEffect(() => {
        maintenanceLeads.forEach(lead => {
            fetchMaintenancePayments(lead.id);
        });
    }, [maintenanceLeads, fetchMaintenancePayments]);

    useEffect(() => {
        let total = 0;
        let monthlyTotal = 0;
        maintenanceLeads.forEach(lead => {
            if (maintenancePayments[lead.id]) {
                maintenancePayments[lead.id].forEach(payment => {
                    total += parseFloat(payment.amount);
                });
            }
            monthlyTotal += parseFloat(lead.website_maintenance_payment || 0); // Changed to website_maintenance_payment
        });
        setTotalMaintenancePayment(total);
        setTotalMonthlyPayment(monthlyTotal);
    }, [maintenanceLeads, maintenancePayments]);

    const getDateFormat = () => {
        return "month"; // Maintenance payments are monthly
    };

    const handleDueDateClick = (leadId, dueDate) => {
        setEditingDueDate(leadId);
        setDueDateValue(dueDate);
    };

    const handleDueDateChange = (e) => {
        setDueDateValue(e.target.value);
    };

    const handleDueDateSave = async (leadId) => {
        try {
            await axios.put(`${baseUrl}/api/leads/${leadId}`, { website_maintenance_due_date: dueDateValue }, { // Changed to website_maintenance_due_date
                headers: { Authorization: `Bearer ${token}` },
            });
            setEditingDueDate(null);
            fetchMaintenanceLeads();
        } catch (error) {
            console.error('Error updating due date:', error);
        }
    };

    const handleDueDateCancel = () => {
        setEditingDueDate(null);
    };

    const handleAddPaymentClick = (leadId) => {
        setSelectedLeadId(leadId);
        setShowPaymentForm(true);
    };

    const handlePaymentFormClose = () => {
        setShowPaymentForm(false);
        setSelectedLeadId(null);
        fetchMaintenancePayments(selectedLeadId);
    };

    const handlePaymentSubmit = () => {
        fetchMaintenancePayments(selectedLeadId);
    };

    if (!user || (user.type !== 1 && user.id !== 2)) {
        return <p>You do not have permission to view this page.</p>;
    }

    return (
        <div className="seo-payment-container">
            <h2>Maintenance Payment History</h2>
            <div className="summary">
                <p>Total Leads: {maintenanceLeads.length}</p>
                <p>Total Maintenance Payment: {totalMaintenancePayment}</p>
            </div>
            <table>
                <thead>
                    <tr className='seo-pay-hist-hd'>
                        <th className="add-payment-col">+Pay</th>
                        <th className="lead-no-col">Lead No</th>
                        <th className="name-col">Name of Client</th>
                        <th className="due-date-col">Due Date</th>
                        <th className="amount-col">Amount</th>
                        <th className="payment-history-col">Payment History</th>
                    </tr>
                </thead>
                <tbody>
                    {maintenanceLeads.map(lead => (
                        <tr key={lead.id} className="seo-pay-hist-hd">
                            <td>
                                <FaPlus className="add-payment-icon" onClick={() => handleAddPaymentClick(lead.id)} />
                            </td>
                            <td>
                                <Link to={`/lead/${lead.id}/${lead.lead_no}`} className="lead-no-link">
                                    {lead.lead_no}
                                </Link>
                            </td>
                            <td>{lead.name}</td>
                            <td>
                                {editingDueDate === lead.id ? (
                                    <>
                                        <input type="date" value={dueDateValue} onChange={handleDueDateChange} className="due-date-input" />
                                        <FaSave className="due-date-icon" onClick={() => handleDueDateSave(lead.id)} />
                                        <FaTimes className="due-date-icon" onClick={handleDueDateCancel} />
                                    </>
                                ) : (
                                    <div onClick={() => handleDueDateClick(lead.id, lead.website_maintenance_due_date)}>
                                        <DateFormat dateString={lead.website_maintenance_due_date} format="date_only" /> <FaEdit className="edit-icon" />
                                    </div>
                                )}
                            </td>
                            <td className="monthly-payment">
                                ${lead.website_maintenance_payment}
                            </td>
                            <td>
                                {maintenancePayments[lead.id]?.slice(0, 12).map(payment => (
                                    <span key={payment.payment_id}>
                                        <DateFormat dateString={payment.due_date} format={getDateFormat()} />{" "}
                                    </span>
                                ))}
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan="4" style={{ textAlign: 'right', fontWeight: 'bold' }}>
                            Total Monthly Payment:
                        </td>
                        <td className="total-monthly-payment">${totalMonthlyPayment}</td>
                    </tr>
                </tbody>
            </table>
            <PaymentForm
                leadId={selectedLeadId}
                isOpen={showPaymentForm}
                onClose={handlePaymentFormClose}
                onPaymentSubmit={handlePaymentSubmit}
            />
        </div>
    );
}

export default Maintenance;