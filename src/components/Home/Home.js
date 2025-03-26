// src/components/Home/Home.js
import React from 'react';
import RemindersAndFollowUps from '../Leads/RemindersAndFollowUps';
import RecentLeads from '../Leads/RecentLeads';
import LeadEarnedByMonthlyTable from '../Leads/LeadEarnedByMonthlyTable';
import { useAuth } from '../../contexts/AuthContext';

function Home() {
    const { user } = useAuth();

    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div style={{ flex: 1, padding: '10px' }}>
                    <RemindersAndFollowUps />
                </div>
                <div style={{ flex: 1, padding: '10px' }}>
                    <RecentLeads />
                </div>
            </div>
            {user && (user.type === 1 || user.id === 2) && (
                <LeadEarnedByMonthlyTable />
            )}
        </div>
    );
}

export default Home;
