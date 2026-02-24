import React from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminDashboard from './AdminDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import { Navigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return currentUser.role === 'admin' ? <AdminDashboard /> : <EmployeeDashboard />;
};

export default Dashboard;
