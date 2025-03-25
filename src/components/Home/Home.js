// src/components/Home/Home.js
import React from 'react';
import RemindersAndFollowUps from '../Leads/RemindersAndFollowUps';
import LeadEarnedByMonthlyTable from '../Leads/LeadEarnedByMonthlyTable';
import { useAuth } from '../../contexts/AuthContext';

function Home() {
    const { user } = useAuth();

    return (
        <div>
            <RemindersAndFollowUps />
            {user && (user.type === 1 || user.id === 2) && (
                <LeadEarnedByMonthlyTable />
            )}
        </div>
    );
}

export default Home;