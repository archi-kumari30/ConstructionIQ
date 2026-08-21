import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Unauthorized from './pages/Unauthorized';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Materials from './pages/Materials';
import Equipment from './pages/Equipment';
import Workers from './pages/Workers';

// New global/aggregated pages
import MaterialRequests from './pages/MaterialRequests';
import MaterialInventory from './pages/MaterialInventory';
import MaterialDeliveries from './pages/MaterialDeliveries';
import EquipmentBookings from './pages/EquipmentBookings';
import Suppliers from './pages/Suppliers';
import Incidents from './pages/Incidents';
import Reports from './pages/Reports';
import SearchCatalog from './pages/SearchCatalog';
import Analytics from './pages/Analytics';
import SiteOperations from './pages/SiteOperations';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';

// Public Landing Page and Redirect helper
import LandingPage from './pages/LandingPage';
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const HomeRoute = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <LandingPage />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomeRoute />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected routes wrapped in Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/search" element={<SearchCatalog />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              
              {/* Materials routes */}
              <Route
                path="/materials"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Materials />
                  </ProtectedRoute>
                }
              />
              <Route path="/materials/requests" element={<MaterialRequests />} />
              <Route path="/materials/inventory" element={<MaterialInventory />} />
              <Route path="/materials/deliveries" element={<MaterialDeliveries />} />
              
              {/* Equipment routes */}
              <Route
                path="/equipment"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Equipment />
                  </ProtectedRoute>
                }
              />
              <Route path="/equipment/bookings" element={<EquipmentBookings />} />

              {/* Suppliers, Incidents, Reports routes */}
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/incidents" element={<Incidents />} />
              <Route path="/safety" element={<Incidents />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/site-operations" element={<SiteOperations />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/settings" element={<Settings />} />

              {/* Workers (Admins, PMs, Site Engineers, Contractors) */}
              <Route
                path="/workers"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'project_manager', 'site_engineer', 'contractor']}>
                    <Workers />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
