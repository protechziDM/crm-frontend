import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import DateFormat from '../DateFormat/DateFormat';
import './PaymentArchive.css';
import { Link } from 'react-router-dom';

function PaymentArchive() {
    const [payments, setPayments] = useState([]);
    const [leads, setLeads] = useState({});
    const { token, user } = useAuth();
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [paymentTypes, setPaymentTypes] = useState([]);
    const [paymentProcessors, setPaymentProcessors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPayments = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${baseUrl}/api/payments`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { status: 'trash' }, // Only fetch payments with 'trash' status
            });

            let sortedPayments = response.data.payments.sort((a, b) => {
                return new Date(b.created_at) - new Date(a.created_at);
            });

            setPayments(sortedPayments);
        } catch (error) {
            console.error('Error fetching archived payments:', error);
        } finally {
            setIsLoading(false);
        }
    }, [baseUrl, token]);

    const fetchLeads = useCallback(async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/leads`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const leadsData = {};
            response.data.forEach(lead => {
                leadsData[lead.id] = lead.lead_no;
            });
            setLeads(leadsData);
        } catch (error) {
            console.error('Error fetching leads:', error);
        }
    }, [baseUrl, token]);

    const fetchPaymentTypes = useCallback(async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/payment-types`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPaymentTypes(response.data);
        } catch (error) {
            console.error('Error fetching payment types:', error);
        }
    }, [baseUrl, token]);

    const fetchPaymentProcessors = useCallback(async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/payment-processors`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPaymentProcessors(response.data);
        } catch (error) {
            console.error('Error fetching payment processors:', error);
        }
    }, [baseUrl, token]);

    const getPaymentTypeName = (paymentTypeId) => {
        const paymentType = paymentTypes.find((pt) => pt.id === paymentTypeId);
        return paymentType ? paymentType.name : 'Unknown';
    };

    const getPaymentProcessorName = (paymentProcessorId) => {
        const paymentProcessor = paymentProcessors.find((pp) => pp.id === paymentProcessorId);
        return paymentProcessor ? paymentProcessor.name : 'Unknown';
    };

    const handleDeletePayment = async (paymentId) => {
        if (window.confirm('Are you sure you want to permanently delete this payment?')) {
            try {
                await axios.delete(`${baseUrl}/api/payments/delete/${paymentId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                fetchPayments();
            } catch (error) {
                console.error('Error permanently deleting payment:', error);
            }
        }
    };

    const handleRestorePayment = async (paymentId) => {
        try {
            const payment = payments.find(p => p.payment_id === paymentId); //find the payment object.
            if (!payment) {
                console.error("Payment not found");
                return;
            }
    
            const restoreUrl = `${baseUrl}/api/payments/${paymentId}`;
            console.log("Restore URL:", restoreUrl);
            console.log("Token:", token);
    
            const response = await axios.put(restoreUrl, {
                status: 'active',
                lead_id: payment.lead_id, // include lead_id
                payment_type_id: payment.payment_type_id,
                amount: payment.amount,
                payment_source_id: payment.payment_source_id,
                due_date: payment.due_date,
                created_at: payment.created_at,
                remarks: payment.remarks,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            console.log("Restore Response:", response);
            fetchPayments();
        } catch (error) {
            console.error('Error restoring payment:', error);
            console.log("Error Response Data:", error.response?.data);
            console.log("Error Response Status:", error.response?.status);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([
                fetchLeads(),
                fetchPaymentTypes(),
                fetchPaymentProcessors(),
            ]);
            fetchPayments();
        };

        fetchData();
    }, [fetchPayments, fetchLeads, fetchPaymentTypes, fetchPaymentProcessors]);

    if (!user || (user.type !== 1 && user.id !== 2)) {
        return <p>You do not have permission to view this page.</p>;
    }

    return (
        <div className="payments-main-container-archive">
            <h2>Archived Payments</h2>
            {isLoading ? <p>Loading...</p> : (
                <div className="payment-main-table-wrapper">
                    <table className="payment-table-main">
                        <thead>
                            <tr>
                                <th>Lead No.</th>
                                <th>Client Name</th>
                                <th>Service</th>
                                <th>Due Date</th>
                                <th>Received Date</th>
                                <th>Amount</th>
                                <th>Source</th>
                                <th>Remarks</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((payment) => (
                                <tr key={payment.payment_id}>
                                    <td>
                                        <Link to={`/lead/${payment.lead_id}/${leads[payment.lead_id]}`}>
                                            {leads[payment.lead_id]}
                                        </Link>
                                    </td>
                                    <td>{payment.lead_name || "Unknown"}</td>
                                    <td>{getPaymentTypeName(payment.payment_type_id)}</td>
                                    <td><DateFormat dateString={payment.due_date} format="date_only" /></td>
                                    <td><DateFormat dateString={payment.created_at} format="date_only" /></td>
                                    <td style={{ color: 'green', fontWeight: '500' }}>${payment.amount}</td>
                                    <td>{getPaymentProcessorName(payment.payment_source_id)}</td>
                                    <td>{payment.remarks}</td>
                                    <td>
                                        <button onClick={() => handleDeletePayment(payment.payment_id)} className="del-btn">Delete</button>
                                        <button onClick={() => handleRestorePayment(payment.payment_id)} className="res-btn">Restore</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default PaymentArchive;