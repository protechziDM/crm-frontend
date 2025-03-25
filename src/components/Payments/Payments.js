import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { FaEllipsisV } from 'react-icons/fa';
import DateFormat from '../DateFormat/DateFormat';
import PaymentEdit from '../PaymentForm/PaymentEdit';
import './Payments.css';
import { Link } from 'react-router-dom';

function Payments() {
    const [payments, setPayments] = useState([]);
    const [leads, setLeads] = useState({});
    const { token, user } = useAuth();
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [paymentToEdit, setPaymentToEdit] = useState(null);
    const [paymentTypes, setPaymentTypes] = useState([]);
    const [paymentProcessors, setPaymentProcessors] = useState([]);
    const [editSuccessMessage, setEditSuccessMessage] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [paymentTypeFilter, setPaymentTypeFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchPayments = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = {
                page: 1,
                limit: 10000,
                search: searchQuery,
                paymentType: paymentTypeFilter,
                status: 'active',
            };

            const response = await axios.get(`${baseUrl}/api/payments`, {
                headers: { Authorization: `Bearer ${token}` },
                params: params,
            });

            let sortedPayments = response.data.payments.sort((a, b) => {
                return new Date(b.created_at) - new Date(a.created_at);
            });

            let currentMonth = '';
            let monthTotals = {};
            const paymentsWithTotals = [];
            let distinctMonths = [];

            sortedPayments.forEach(payment => {
                const paymentMonth = getMonthYear(payment.created_at);
                if (paymentMonth !== currentMonth && currentMonth !== '') {
                    paymentsWithTotals.push({ isTotal: true, month: currentMonth, total: monthTotals[currentMonth] });
                    if (!distinctMonths.includes(currentMonth)) {
                        distinctMonths.push(currentMonth);
                    }
                }
                currentMonth = paymentMonth;
                if (!monthTotals[currentMonth]) {
                    monthTotals[currentMonth] = 0;
                }
                monthTotals[currentMonth] += parseFloat(payment.amount);
                paymentsWithTotals.push(payment);
            });

            if (sortedPayments.length > 0) {
                paymentsWithTotals.push({ isTotal: true, month: currentMonth, total: monthTotals[currentMonth] });
                if (!distinctMonths.includes(currentMonth)) {
                    distinctMonths.push(currentMonth);
                }
            }

            const totalPagesCalculated = Math.ceil(distinctMonths.length / 3);
            setTotalPages(totalPagesCalculated);

            const startMonthIndex = (currentPage - 1) * 3;
            const endMonthIndex = startMonthIndex + 3;
            const currentPageMonths = distinctMonths.slice(startMonthIndex, endMonthIndex);

            const currentPagePayments = paymentsWithTotals.filter(payment => {
                if (payment.isTotal) {
                    return currentPageMonths.includes(payment.month);
                }
                return currentPageMonths.includes(getMonthYear(payment.created_at));
            });

            setPayments(currentPagePayments);
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setIsLoading(false);
        }
    }, [baseUrl, token, currentPage, searchQuery, paymentTypeFilter]);

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

    const handleClearFilters = () => {
        setSearchQuery('');
        setPaymentTypeFilter('');
        setCurrentPage(1);
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

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
        setDropdownOpen(prev => ({ ...prev, [payment.payment_id]: false }));
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        setPaymentToEdit(null);
        setEditSuccessMessage('');
    };

    const handlePaymentUpdate = () => {
        fetchPayments();
        setEditSuccessMessage('Payment updated successfully!');
    };

    const handleDeletePayment = async (paymentId) => {
        if (window.confirm('Are you sure you want to delete this payment?')) {
            try {
                await axios.delete(`<span class="math-inline">\{baseUrl\}/api/payments/trash/</span>{paymentId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                fetchPayments();
            } catch (error) {
                console.error('Error deleting payment:', error);
            }
        }
        setDropdownOpen(prev => ({ ...prev, [paymentId]: false }));
    };

    const toggleDropdown = (paymentId) => {
        setDropdownOpen(prev => ({
            ...prev,
            [paymentId]: !prev[paymentId],
        }));
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

    if (!user || (user.type !== 1 && user.id !== 2)){
        return <p>You do not have permission to view this page.</p>;
    }

    return (
        <div className="payments-main-container">
            <h2>All Payment History : </h2>
            <div className="filters">
                <input
                    type="text"
                    placeholder="Search Lead No./Name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select value={paymentTypeFilter} onChange={(e) => setPaymentTypeFilter(e.target.value)}>
                    <option value="">All Payment Types</option>
                    {paymentTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                            {type.name}
                        </option>
                    ))}
                </select>
                <button onClick={handleClearFilters} className="clear-btn">Clear Filters</button>
            </div>

            {isLoading ? <p>Loading...</p> : (
                <div className="payment-main-table-wrapper">
                    <table className="payment-table-main">
                        <thead>
                            <tr>
                                <th><FaEllipsisV /></th>
                                <th>Lead No.</th>
                                <th>Client Name</th>
                                <th>Service</th>
                                <th>Due Date</th>
                                <th>Received Date</th>
                                <th>Amount</th>
                                <th>Period</th>
                                <th>Source</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((payment, index) => (
                                payment.isTotal ? (
                                    <tr key={`total-${index}`} className="total-row">
                                        <td colSpan="6"></td>
                                        <td style={{ color: 'blue', fontWeight: 'bold' }}>
                                            Total : ${parseFloat(payment.total).toFixed(2)}
                                        </td>
                                        <td colSpan="3"></td>
                                    </tr>
                                ) : (
                                    <tr key={payment.payment_id}>
                                        <td>
                                            <div className="dropdown-container">
                                                <FaEllipsisV className="ellipsis-icon" onClick={() => toggleDropdown(payment.payment_id)} />
                                                {dropdownOpen[payment.payment_id] && (
                                                    <div className="dropdown-menu">
                                                        <div className="dropdown-item" onClick={() => handleEditClick(payment)}>Edit</div>
                                                        <div className="dropdown-item" onClick={() => handleDeletePayment(payment.payment_id)}>Delete</div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
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
                                        <td>{getMonthYear(payment.due_date)}</td>
                                        <td>{getPaymentProcessorName(payment.payment_source_id)}</td>
                                        <td>{payment.remarks}</td>
                                    </tr>
                                )
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {renderPagination()}

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

export default Payments;