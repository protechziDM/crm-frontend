import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { FaEdit, FaTrash } from 'react-icons/fa';
import DateFormat from '../DateFormat/DateFormat';
import PaymentEdit from '../PaymentForm/PaymentEdit';
import './PaymentForLead.css';

//declare validPaymentTypeIds outside of the component to prevent unneeded re-renders.
const validPaymentTypeIds = [1, 2, 3, 5];

function PaymentForLead({ leadId, onPaymentChange, refreshPayments }) {
    const [payments, setPayments] = useState([]);
    const [leadName, setLeadName] = useState('');
    const { token } = useAuth();
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [paymentToEdit, setPaymentToEdit] = useState(null);
    const [paymentTypes, setPaymentTypes] = useState([]);
    const [paymentProcessors, setPaymentProcessors] = useState([]);
    const [totalPayment, setTotalPayment] = useState(0);
    const [editSuccessMessage, setEditSuccessMessage] = useState('');
    const [filteredPayments, setFilteredPayments] = useState({});
    const [showPaymentFilters, setShowPaymentFilters] = useState(false);
    const [visiblePaymentTypeIds, setVisiblePaymentTypeIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchPayments = useCallback(async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/payments/lead/${leadId}`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { status: 'active' } 
            });
    
            // Sort payments by created_at in descending order (newest first)
            const sortedPayments = response.data.sort((a, b) => {
                return new Date(b.created_at) - new Date(a.created_at);
            });
    
            setPayments(sortedPayments);
            calculateTotalPayment(sortedPayments);
        } catch (error) {
            console.error('Error fetching payments:', error);
        }
    }, [baseUrl, leadId, token]);

    const calculateTotalPayment = (paymentsData) => {
        const total = paymentsData.reduce((acc, payment) => acc + parseFloat(payment.amount), 0);
        setTotalPayment(total);
    };

    const fetchLeadName = useCallback(async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/leads/${leadId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLeadName(response.data.name);
        } catch (error) {
            console.error('Error fetching lead name:', error);
        }
    }, [baseUrl, leadId, token]);

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

    const getMonthYear = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        return `${month} ${year}`;
    };

    const getPaymentTypeName = (paymentTypeId) => {
        const paymentType = paymentTypes.find((pt) => pt.id === paymentTypeId);
        return paymentType ? paymentType.name : 'Unknown';
    };

    const getPaymentProcessorName = (paymentProcessorId) => {
        const paymentProcessor = paymentProcessors.find((pp) => pp.id === paymentProcessorId);
        return paymentProcessor ? paymentProcessor.name : 'Unknown';
    };

    const handleEditClick = (payment) => {
        setPaymentToEdit(payment);
        setIsEditModalOpen(true);
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        setPaymentToEdit(null);
        setEditSuccessMessage('');
    };

    const handlePaymentUpdate = () => {
        fetchPayments();
        setEditSuccessMessage('Payment updated successfully!');
        if (onPaymentChange) {
            onPaymentChange();
        }
    };

    const handleDeletePayment = async (paymentId) => {
        if (window.confirm('Are you sure you want to delete this payment?')) {
            try {
                await axios.delete(`${baseUrl}/api/payments/trash/${paymentId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                fetchPayments();
                if (onPaymentChange) {
                    onPaymentChange();
                }
            } catch (error) {
                console.error('Error marking payment as trash:', error);
            }
        }
    };

    const fetchLeadServices = useCallback(async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/lead-services/${leadId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const leadServiceIds = response.data;
            const matchingServiceIds = leadServiceIds.filter(serviceId => validPaymentTypeIds.includes(serviceId));
            const serviceToPaymentMap = {
                1: 1, // service_id 1 -> payment_type_id 1
                2: 2, // service_id 2 -> payment_type_id 2
                5: 7, // service_id 5 -> payment_type_id 7 (Domain)
                3: 4, // service_id 3 -> payment_type_id 4 (Web Maintenance )
            };

            const visibleIds = matchingServiceIds.map(serviceId => serviceToPaymentMap[serviceId]).filter(id => id); //filter out undefined
            setVisiblePaymentTypeIds(visibleIds);
            setShowPaymentFilters(visibleIds.length > 0);

        } catch (error) {
            console.error('Error fetching lead services:', error);
        }
    }, [baseUrl, leadId, token]);

    useEffect(() => {
        if (leadId) {
            fetchPayments();
            fetchLeadName();
            fetchPaymentTypes();
            fetchPaymentProcessors();
            fetchLeadServices();
        }
    }, [leadId, fetchPayments, fetchLeadName, fetchPaymentTypes, fetchPaymentProcessors, refreshPayments, fetchLeadServices]);

    useEffect(() => {
        const groupedPayments = {};
        paymentTypes.forEach((type) => {
            if (visiblePaymentTypeIds.includes(type.id)) {
                let filtered = payments.filter((payment) => payment.payment_type_id === type.id);

                // Sort by created_at in descending order (newest first)
                filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                // Filter to 16 items
                filtered = filtered.slice(0, 16);

                groupedPayments[type.id] = filtered;
            }
        });
        setFilteredPayments(groupedPayments);
    }, [payments, paymentTypes, visiblePaymentTypeIds]);

    const getDateFormat = (paymentTypeId) => {
        switch (paymentTypeId) {
            case 1: // SEO Payments
            case 3: // Web Maintenance
                return "month";
            case 2: // Hosting payment
            case 7: // Domain
                return "year";
            default:
                return "month"; // Default to month
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPayments = payments.slice(indexOfFirstItem, indexOfLastItem);

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < Math.ceil(payments.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    }

    const totalPages = Math.ceil(payments.length / itemsPerPage);

    const renderPagination = () => {
        return (
            <div className="pagination">
                <div className="pagination-links">
                    {currentPage > 1 && (
                        <div className="page-link" onClick={handlePrevPage}>
                            ⬅
                        </div>
                    )}
                    <div className={`page-link active`}>
                        {currentPage}
                    </div>
                    {currentPage < totalPages && (
                        <div className="page-link" onClick={handleNextPage}>
                            ➡
                        </div>
                    )}
                </div>
            </div>
        );
    };

    
    
    return (
        <div className="payment-for-lead-container">
            {/* Filtered Payments Section */}
            {showPaymentFilters && (
                <div className="filtered-payments">
                    <table>
                        <thead>
                            <tr>
                                <th>Payment Type</th>
                                <th>Payment History</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentTypes.filter(type => visiblePaymentTypeIds.includes(type.id)).map((type) => {
                                return (
                                    <tr key={type.id}>
                                        <td>{type.name}</td>
                                        <td>
                                            {filteredPayments[type.id]?.map((payment) => (
                                                <span key={payment.payment_id}>
                                                    <DateFormat
                                                        dateString={payment.due_date}
                                                        format={getDateFormat(type.id)}
                                                    />
                                                    {" "}
                                                </span>
                                            ))}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
    
            <div className="payment-header">
                <h2>Payments for <span>{leadName}</span></h2>
                <div className="total-payment">Total: <span>${totalPayment.toFixed(2)}</span></div>
            </div>
    
            <div className="payment-table-wrapper">
                <table className="payment-table">
                    <thead>
                        <tr>
                            <th>Edit</th>
                            <th>Client Name</th>
                            <th>Service</th>
                            <th>Due Date</th>
                            <th>Received Date</th>
                            <th>Amount</th>
                            <th>Period</th>
                            <th>Source</th>
                            <th>Remarks</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                            {currentPayments.map((payment) => (
                            <tr key={payment.payment_id}>
                                <td><FaEdit onClick={() => handleEditClick(payment)} style={{ cursor: 'pointer' }} /></td>
                                <td>{leadName}</td>
                                <td>{getPaymentTypeName(payment.payment_type_id)}</td>
                                <td><DateFormat dateString={payment.due_date} format="date_only" /></td>
                                <td><DateFormat dateString={payment.created_at} format="date_only" /></td>
                                <td style={{ color: 'green', fontWeight: '500' }}>${payment.amount}</td>
                                <td>{getMonthYear(payment.due_date)}</td>
                                <td>{getPaymentProcessorName(payment.payment_source_id)}</td>
                                <td>{payment.remarks}</td>
                                <td><FaTrash onClick={() => handleDeletePayment(payment.payment_id)} style={{ cursor: 'pointer', color: 'red' }} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {renderPagination()}
            </div>
            {paymentToEdit && (
                <PaymentEdit
                    paymentData={paymentToEdit}
                    isOpen={isEditModalOpen}
                    onClose={handleEditModalClose}
                    onPaymentSubmit={handlePaymentUpdate}
                    successMessage={editSuccessMessage}
                />
            )}
        </div>
    );
}

export default PaymentForLead;