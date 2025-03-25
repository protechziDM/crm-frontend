import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './PaymentForm.css';
import { BsX } from 'react-icons/bs';
import { useAuth } from '../../contexts/AuthContext';

function PaymentEdit({ paymentData, isOpen, onClose, onPaymentSubmit }) {
    const [paymentTypeId, setPaymentTypeId] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentSourceId, setPaymentSourceId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [receivedDate, setReceivedDate] = useState('');
    const [remarks, setRemarks] = useState('');
    const [paymentTypes, setPaymentTypes] = useState([]);
    const [paymentProcessors, setPaymentProcessors] = useState([]);
    const { user, token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const fetchPaymentOptions = useCallback(async () => {
        try {
            const baseUrl = process.env.REACT_APP_API_BASE_URL;
            const typesResponse = await axios.get(`${baseUrl}/api/payment-types`, { headers: { Authorization: `Bearer ${token}` } });
            setPaymentTypes(typesResponse.data);
            const processorsResponse = await axios.get(`${baseUrl}/api/payment-processors`, { headers: { Authorization: `Bearer ${token}` } });
            setPaymentProcessors(processorsResponse.data);
        } catch (error) {
            console.error('Error fetching payment options:', error);
            setMessage('Error fetching payment options. Please try again.');
            setIsSuccess(false);
        }
    }, [token]);

    useEffect(() => {
        if (isOpen && paymentData) {
            fetchPaymentOptions();
            setPaymentTypeId(paymentData.payment_type_id);
            setAmount(paymentData.amount);
            setPaymentSourceId(paymentData.payment_source_id);
            setDueDate(formatDate(paymentData.due_date));
            setReceivedDate(formatDate(paymentData.created_at));
            setRemarks(paymentData.remarks || '');
        }
    }, [isOpen, paymentData, fetchPaymentOptions]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setIsSuccess(false);
        try {
            const baseUrl = process.env.REACT_APP_API_BASE_URL;
            await axios.put(
                `${baseUrl}/api/payments/${paymentData.payment_id}`,
                {
                    lead_id: paymentData.lead_id,
                    payment_type_id: paymentTypeId,
                    amount: amount,
                    payment_source_id: paymentSourceId,
                    due_date: dueDate,
                    created_at: receivedDate || null,
                    remarks: remarks,
                    author_id: paymentData.author_id,
                    userId: user.userId,
                    status: 'active',
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setMessage('Payment updated successfully!');
            setIsSuccess(true);
            setIsLoading(false);
            onPaymentSubmit();
        } catch (error) {
            setMessage('Error updating payment. Please try again.');
            setIsSuccess(false);
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="payment-form-overlay">
            <div className="payment-form-popup">
                <div className="payment-form-header">
                    <div style={{ marginBottom: '10px' }}>
                    </div>
                    <h2>Edit Payment</h2>
                    <BsX className="close-icon" onClick={onClose} />
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="payment-form-row">
                        <div className="form-column">
                            <label>Payment Type:</label>
                            <select value={paymentTypeId} onChange={(e) => setPaymentTypeId(e.target.value)}>
                                <option value="">Select Payment Type</option>
                                {paymentTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                            <label>Due Date:</label>
                            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                            <label>Processor:</label>
                            <select value={paymentSourceId} onChange={(e) => setPaymentSourceId(e.target.value)}>
                                <option value="">Select Processor</option>
                                {paymentProcessors.map((proc) => (
                                    <option key={proc.id} value={proc.id}>
                                        {proc.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-column">
                            <label>Amount:</label>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                            <label>Received Date:</label>
                            <input type="date" value={receivedDate} onChange={(e) => setReceivedDate(e.target.value)} />
                        </div>
                    </div>
                    <label>Remarks:</label>
                    <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Updating...' : 'Update'}
                    </button>
                    {message && (
                        <div className={`message ${isSuccess ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default PaymentEdit;