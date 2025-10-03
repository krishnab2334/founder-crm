import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import FounderDashboard from '../pages/FounderDashboard';
import TeamMemberDashboard from '../pages/TeamMemberDashboard';

const DashboardRouter = () => {
  const { user } = useAuth();

  // Route to appropriate dashboard based on user role
  if (user?.role === 'founder') {
    return <FounderDashboard />;
  }

  return <TeamMemberDashboard />;
};

export default DashboardRouter;