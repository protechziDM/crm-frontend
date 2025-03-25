import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LeadEarnedByMonthlyTable.css';

function LeadEarnedByMonthlyTable() {
    const [leadEarnedByList, setLeadEarnedByList] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const leadEarnedByResponse = await axios.get(`${baseUrl}/api/lead-earned-by`);
                setLeadEarnedByList(leadEarnedByResponse.data);

                const monthlyDataResponse = await axios.get(`${baseUrl}/api/leads/monthly-earned`);
                setMonthlyData(monthlyDataResponse.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [baseUrl]);

    const getMonthName = (monthIndex) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months[monthIndex];
    };

    const generateMonthHeaders = () => {
        const headers = [];
        const currentDate = new Date();
        for (let i = 0; i < 12; i++) {
            const month = currentDate.getMonth() - i;
            const year = currentDate.getFullYear() - (month < 0 ? 1 : 0);
            const normalizedMonth = (month + 12) % 12; // Handle negative months
            headers.push(`${getMonthName(normalizedMonth)} ${year}`);
        }
        return headers;
    };

    const monthHeaders = generateMonthHeaders();

    const getLeadCountForMonth = (leadEarnedById, month, year) => {
        const data = monthlyData.find(item =>
            item.lead_earned_by_id === leadEarnedById &&
            new Date(item.month).getMonth() === month &&
            new Date(item.month).getFullYear() === year
        );
        return data ? data.leadCount : 0;
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    return (
        <div className="lead-earned-by">
            <h4>Lead Earned By Monthly Report</h4>
            <table>
                <thead>
                    <tr>
                        <th>Lead Earned By</th>
                        {monthHeaders.map(header => (
                            <th key={header}>{header}</th>
                        ))}
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {leadEarnedByList.map(earnedBy => {
                        let totalLeads = 0;
                        return (
                            <tr key={earnedBy.id}>
                                <td>{earnedBy.name}</td>
                                {monthHeaders.map(header => {
                                    const [monthName, year] = header.split(' ');
                                    const monthIndex = new Date(Date.parse(monthName + " 1, " + year)).getMonth();
                                    const leadCount = getLeadCountForMonth(earnedBy.id, monthIndex, parseInt(year));
                                    totalLeads += leadCount;
                                    return <td key={`${earnedBy.id}-${header}`}>{leadCount}</td>;
                                })}
                                <td>{totalLeads}</td>
                            </tr>
                        );
                    })}
                    <tr>
                        <td><b>Monthly Totals</b></td>
                        {monthHeaders.map(header => {
                            const [monthName, year] = header.split(' ');
                            const monthIndex = new Date(Date.parse(monthName + " 1, " + year)).getMonth();
                            let monthTotal = 0;
                            leadEarnedByList.forEach(earnedBy => {
                                monthTotal += getLeadCountForMonth(earnedBy.id, monthIndex, parseInt(year));
                            });
                            return <td key={`total-${header}`}><b>{monthTotal}</b></td>;
                        })}
                        <td><b>{leadEarnedByList.reduce((acc, earnedBy) => {
                            let total = 0;
                            monthHeaders.forEach(header => {
                                const [monthName, year] = header.split(' ');
                                const monthIndex = new Date(Date.parse(monthName + " 1, " + year)).getMonth();
                                total += getLeadCountForMonth(earnedBy.id, monthIndex, parseInt(year));
                            });
                            return acc + total;
                        }, 0)}</b></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default LeadEarnedByMonthlyTable;