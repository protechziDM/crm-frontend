import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './SeoPayment.css';
import { useAuth } from '../../contexts/AuthContext';
import DateFormat from '../DateFormat/DateFormat';
import PaymentForm from '../PaymentForm/PaymentForm';
import { FaPlus, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function HostingPayment() {
    const [hostingLeads, setHostingLeads] = useState([]);
    const [hostingPayments, setHostingPayments] = useState({});
    const [editingDueDate, setEditingDueDate] = useState(null);
    const [dueDateValue, setDueDateValue] = useState('');
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [selectedLeadId, setSelectedLeadId] = useState(null);
    const { token, user } = useAuth();
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [totalMonthlyPayment, setTotalMonthlyPayment] = useState(0);

    const fetchHostingLeads = useCallback(async () => {
        try {
            const leadsResponse = await axios.get(`${baseUrl}/api/leads`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const leads = leadsResponse.data;

            const leadServicesResponse = await axios.get(`${baseUrl}/api/lead-services`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const allLeadServices = leadServicesResponse.data;

            const hostingLeadIds = allLeadServices
                .filter(service => service.service_id === 2) // Changed to service_id 2
                .map(service => service.lead_id);

            const hostingLeadsData = leads.filter(lead => hostingLeadIds.includes(lead.id));

            hostingLeadsData.sort((a, b) => new Date(a.hosting_due_date) - new Date(b.hosting_due_date)); // changed to hosting_due_date

            setHostingLeads(hostingLeadsData);
        } catch (error) {
            console.error('Error fetching Hosting leads:', error);
        }
    }, [baseUrl, token]);

    const fetchHostingPayments = useCallback(async (leadId) => {
        try {
            const paymentsResponse = await axios.get(`${baseUrl}/api/payments/lead/${leadId}`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { status: 'active' },
            });
            let payments = paymentsResponse.data.filter(payment => payment.payment_type_id === 2); // Changed to payment_type_id 2

            payments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setHostingPayments(prevPayments => ({
                ...prevPayments,
                [leadId]: payments,
            }));
        } catch (error) {
            console.error(`Error fetching Hosting payments for lead ${leadId}:`, error);
        }
    }, [baseUrl, token]);

    useEffect(() => {
        fetchHostingLeads();
    }, [fetchHostingLeads]);

    useEffect(() => {
        hostingLeads.forEach(lead => {
            fetchHostingPayments(lead.id);
        });
    }, [hostingLeads, fetchHostingPayments]);

    useEffect(() => {
        let total = 0;
        let monthlyTotal = 0;
        hostingLeads.forEach(lead => {
            if (hostingPayments[lead.id]) {
                hostingPayments[lead.id].forEach(payment => {
                    total += parseFloat(payment.amount);
                });
            }
            monthlyTotal += parseFloat(lead.hosting_payment || 0); // changed to hosting_monthly_payment
        });
        setTotalMonthlyPayment(monthlyTotal);
    }, [hostingLeads, hostingPayments]);

    const getDateFormat = () => {
        return "year";
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
            await axios.put(`${baseUrl}/api/leads/${leadId}`, { hosting_due_date: dueDateValue }, { //changed to hosting_due_date
                headers: { Authorization: `Bearer ${token}` },
            });
            setEditingDueDate(null);
            fetchHostingLeads();
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
        fetchHostingPayments(selectedLeadId);
    };

    const handlePaymentSubmit = () => {
        fetchHostingPayments(selectedLeadId);
    };

    if (!user || (user.type !== 1 && user.id !== 2)) {
        return <p>You do not have permission to view this page.</p>;
    }

    return (
        <div className="seo-payment-container"> {/* Maintained CSS class */}
            <h2>Hosting Payment History : </h2>
            <div className="summary">
                <p>Total Leads: {hostingLeads.length}</p>
            </div>
            <table>
                <thead>
                    <tr className='seo-pay-hist-hd'> {/* Maintained CSS class */}
                        <th className="add-payment-col">+Pay</th>
                        <th className="lead-no-col">Lead No</th>
                        <th className="name-col">Name of Client</th>
                        <th className="due-date-col">Due Date</th>
                        <th className="amount-col">Amount</th>
                        <th className="payment-history-col">Payment History</th>
                    </tr>
                </thead>
                <tbody>
                    {hostingLeads.map(lead => (
                        <tr key={lead.id} className="seo-pay-hist-hd"> {/* Maintained CSS class */}
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
                                    <div onClick={() => handleDueDateClick(lead.id, lead.hosting_due_date)}>
                                        <DateFormat dateString={lead.hosting_due_date} format="date_only" /> <FaEdit className="edit-icon" />
                                    </div>
                                )}
                            </td>
                            <td className="monthly-payment">
                                ${lead.hosting_payment}
                            </td>
                            <td>
                                {hostingPayments[lead.id]?.slice(0, 12).map(payment => (
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

export default HostingPayment;