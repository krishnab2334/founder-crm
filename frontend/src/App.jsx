import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import DashboardRouter from './routes/DashboardRouter';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import TeamMemberRegister from './pages/TeamMemberRegister';
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
    <BrowserRouter>
      <AuthProvider>
        <WebSocketProvider>
          <ErrorBoundary>
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
              <Route path="/register-team-member" element={<TeamMemberRegister />} />
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
          </ErrorBoundary>
        </WebSocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
