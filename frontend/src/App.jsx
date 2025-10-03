import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AcceptInvitation from './pages/AcceptInvitation';
import FounderDashboard from './pages/FounderDashboard';
import TeamMemberDashboard from './pages/TeamMemberDashboard';
import Contacts from './pages/Contacts';
import ContactDetail from './pages/ContactDetail';
import Tasks from './pages/Tasks';
import Pipeline from './pages/Pipeline';
import TeamManagement from './pages/TeamManagement';

function App() {
  return (
    <Router>
      <AuthProvider>
        <WebSocketProvider>
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/accept-invitation/:token" element={<AcceptInvitation />} />

            {/* Private Routes */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <DashboardRouter />
              </PrivateRoute>
            } />
            
            <Route path="/contacts" element={
              <PrivateRoute>
                <Contacts />
              </PrivateRoute>
            } />

            <Route path="/contacts/:id" element={
              <PrivateRoute>
                <ContactDetail />
              </PrivateRoute>
            } />

            <Route path="/tasks" element={
              <PrivateRoute>
                <Tasks />
              </PrivateRoute>
            } />

            <Route path="/pipeline" element={
              <PrivateRoute>
                <Pipeline />
              </PrivateRoute>
            } />

            <Route path="/team" element={
              <PrivateRoute>
                <TeamManagement />
              </PrivateRoute>
            } />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </WebSocketProvider>
      </AuthProvider>
    </Router>
  );
}

// Dashboard Router based on role
function DashboardRouter() {
  const { user } = React.useContext(require('./contexts/AuthContext').AuthContext);
  
  if (user?.role === 'founder') {
    return <FounderDashboard />;
  } else {
    return <TeamMemberDashboard />;
  }
}

export default App;
