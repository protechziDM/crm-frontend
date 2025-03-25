// src/App.js
import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useParams, useNavigate } from 'react-router-dom';
import GlobalData from './components/GlobalData/GlobalData';
import LeadForm from './components/LeadForm/LeadForm';
import Home from './components/Home/Home';
import Layout from './components/Layout/Layout';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Users from './components/Users/Users';
import Login from './components/Login/Login';
import Leads from './components/Leads/Leads';
import LeadDisplay from './components/LeadDisplay/LeadDisplay';
import LeadsArchive from './components/LeadsArchive/LeadsArchive';
import './App.css';
import { TooltipProvider } from './contexts/TooltipContext';
import FullLeadEdit from './components/FullLeadEdit/FullLeadEdit';
import LeadUpload from './components/LeadUpload/LeadUpload';
import SeoPayment from './components/SeoPayment/SeoPayment';
import HostingPayment from './components/SeoPayment/HostingPayment';
import Maintenance from './components/SeoPayment/Maintenance';
import Payments from './components/Payments/Payments';
import PaymentArchive from './components/Payments/PaymentArchive'; // Import PaymentArchive
import { BreadcrumbProvider } from './contexts/BreadcrumbContext';

function App() {
    const [appLoading, setAppLoading] = useState(true);
    const { loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            setAppLoading(false);
        }
    }, [loading]);

    if (appLoading) {
        return <div>Loading App...</div>;
    }

    return (
        <div className="app">
            <TooltipProvider>
                <BreadcrumbProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/*"
                            element={
                                <Layout>
                                    <ProtectedRoute>
                                        <Routes>
                                            <Route path="/" element={<Navigate to="/home" replace />} />
                                            <Route path="/home" element={<Home />} />
                                            <Route path="/global-data" element={<GlobalData />} />
                                            <Route path="/lead-form" element={<LeadForm />} />
                                            <Route path="/users" element={<Users />} />
                                            <Route path="/leads" element={<Leads />} />
                                            <Route path="/lead/:id/:leadNo" element={<LeadDisplay />} />
                                            <Route path="/leads-archive" element={<LeadsArchive />} />
                                            <Route path="/lead/:id/edit" element={<FullLeadEditWrapper />} />
                                            <Route path="/lead-upload" element={<LeadUpload />} />
                                            <Route path="/seo-payments" element={<SeoPayment />} />
                                            <Route path="/hosting-payments" element={<HostingPayment />} />
                                            <Route path="/web-maintenance" element={<Maintenance />} />
                                            <Route path="/all-payments" element={<Payments />} />
                                            <Route path="/payment-archive" element={<PaymentArchive />} /> {/* Add PaymentArchive Route */}
                                            <Route path="*" element={<div>404 Not Found</div>} />
                                        </Routes>
                                    </ProtectedRoute>
                                </Layout>
                            }
                        />
                    </Routes>
                </BreadcrumbProvider>
            </TooltipProvider>
        </div>
    );
}

function FullLeadEditWrapper() {
    const { id } = useParams();
    const navigate = useNavigate();

    const handleClose = () => {
        navigate(`/lead/${id}`);
    };

    const handleLeadUpdate = () => {
        navigate(`/lead/${id}`);
    };

    return (
        <FullLeadEdit leadId={id} onClose={handleClose} onLeadUpdate={handleLeadUpdate} />
    );
}

export default App;