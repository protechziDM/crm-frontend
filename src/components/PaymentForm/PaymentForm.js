import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './PaymentForm.css';
import { BsX } from 'react-icons/bs';
import { useAuth } from '../../contexts/AuthContext';

function PaymentForm({ leadId, isOpen, onClose, onPaymentSubmit }) {
    const [paymentTypeId, setPaymentTypeId] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentSourceId, setPaymentSourceId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [receivedDate, setReceivedDate] = useState('');
    const [remarks, setRemarks] = useState('');
    const [paymentTypes, setPaymentTypes] = useState([]);
    const [paymentProcessors, setPaymentProcessors] = useState([]);
    const { user, token } = useAuth();
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const fetchPaymentOptions = useCallback(async () => { // Use useCallback
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
    }, [token]); // Add token as a dependency if needed.

    useEffect(() => {
        if (isOpen) {
            fetchPaymentOptions();
            resetForm();
        }
    }, [isOpen, fetchPaymentOptions]); // Now it's safe

    const resetForm = () => {
        setPaymentTypeId('');
        setAmount('');
        setPaymentSourceId('');
        setDueDate('');
        setReceivedDate('');
        setRemarks('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setIsSuccess(false);
        try {
            const baseUrl = process.env.REACT_APP_API_BASE_URL;
            await axios.post(
                `${baseUrl}/api/payments`,
                {
                    lead_id: leadId,
                    payment_type_id: paymentTypeId,
                    amount: amount,
                    payment_source_id: paymentSourceId,
                    due_date: dueDate,
                    received_date: receivedDate,
                    remarks: remarks,
                    author_id: user.id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setMessage('Payment added successfully!');
            setIsSuccess(true);
            setIsLoading(false);
            onPaymentSubmit();
        } catch (error) {
            console.error('Error adding payment:', error);
            setMessage('Error adding payment. Please try again.');
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
                    <h2>Add Payment</h2>
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
                        {isLoading ? 'Submitting...' : 'Submit'}
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

export default PaymentForm;