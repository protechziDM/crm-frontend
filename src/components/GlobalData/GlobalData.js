// src/components/GlobalData/GlobalData.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataSection from './../DataSection/DataSection';
import './GlobalData.css';
import { useAuth } from '../../contexts/AuthContext';

function GlobalData() {
    const [leadTypes, setLeadTypes] = useState([]);
    const [leadStatuses, setLeadStatuses] = useState([]);
    const [servicesAvailed, setServicesAvailed] = useState([]);
    const [leadSources, setLeadSources] = useState([]);
    const [hostedOn, setHostedOn] = useState([]);
    const [leadEarnedBy, setLeadEarnedBy] = useState([]);
    const [paymentTypes, setPaymentTypes] = useState([]);
    const [paymentProcessors, setPaymentProcessors] = useState([]);

    const { user } = useAuth();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const baseUrl = process.env.REACT_APP_API_BASE_URL;
            const leadTypesResponse = await axios.get(`${baseUrl}/api/lead-types`);
            setLeadTypes(leadTypesResponse.data);

            const leadStatusesResponse = await axios.get(`${baseUrl}/api/lead-statuses`);
            setLeadStatuses(leadStatusesResponse.data);

            const servicesAvailedResponse = await axios.get(`${baseUrl}/api/services-availed`);
            setServicesAvailed(servicesAvailedResponse.data);

            const leadSourcesResponse = await axios.get(`${baseUrl}/api/lead-sources`);
            setLeadSources(leadSourcesResponse.data);

            const hostedOnResponse = await axios.get(`${baseUrl}/api/hosted-on`);
            setHostedOn(hostedOnResponse.data);

            const leadEarnedByResponse = await axios.get(`${baseUrl}/api/lead-earned-by`);
            setLeadEarnedBy(leadEarnedByResponse.data);

            const paymentTypesResponse = await axios.get(`${baseUrl}/api/payment-types`);
            setPaymentTypes(paymentTypesResponse.data);

            const paymentProcessorsResponse = await axios.get(`${baseUrl}/api/payment-processors`); // Corrected API endpoint
            setPaymentProcessors(paymentProcessorsResponse.data);

        } catch (error) {
            console.error('Error fetching global data:', error);
        }
    };

    if (!user || user.type !== 1) {
        return <p>Access Denied. Only Admins can view this page.</p>;
    }

    return (
        <div className="global-data-container">
            <h2>Global Data</h2>
            <DataSection title="Lead Types" data={leadTypes} fetchData={fetchData} url={`${process.env.REACT_APP_API_BASE_URL}/api/lead-types`} />
            <DataSection title="Lead Statuses" data={leadStatuses} fetchData={fetchData} url={`${process.env.REACT_APP_API_BASE_URL}/api/lead-statuses`} />
            <DataSection title="Services Availed" data={servicesAvailed} fetchData={fetchData} url={`${process.env.REACT_APP_API_BASE_URL}/api/services-availed`} />
            <DataSection title="Lead Sources" data={leadSources} fetchData={fetchData} url={`${process.env.REACT_APP_API_BASE_URL}/api/lead-sources`} />
            <DataSection title="Hosted On" data={hostedOn} fetchData={fetchData} url={`${process.env.REACT_APP_API_BASE_URL}/api/hosted-on`} />
            <DataSection title="Lead Earned By" data={leadEarnedBy} fetchData={fetchData} url={`${process.env.REACT_APP_API_BASE_URL}/api/lead-earned-by`} />
            <DataSection title="Payment Types" data={paymentTypes} fetchData={fetchData} url={`${process.env.REACT_APP_API_BASE_URL}/api/payment-types`} />
            <DataSection title="Payment Processors" data={paymentProcessors} fetchData={fetchData} url={`${process.env.REACT_APP_API_BASE_URL}/api/payment-processors`} />
        </div>
    );
}

export default GlobalData;