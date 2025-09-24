// src/components/ProtectedLayout.tsx
import React from 'react';
import { useAppSelector } from '../hooks';
import { Navigate, Outlet } from 'react-router-dom';
import Layout from './Layout';  // Your existing Layout

const ProtectedLayout: React.FC = () => {
  const {isAuthenticated, hydrated} = useAppSelector((state) => state.auth);
// console.log('ProtectedLayout - isAuthenticated:', isAuthenticated);
if (!hydrated) {
  return <div>Loading...</div>; // or a spinner/skeleton
}

if (!isAuthenticated) {
  // console.log('ProtectedLayout - User is not authenticated');
  return <Navigate to="/login" replace />;
}

  return (
    <Layout>
      <Outlet />  {/* Renders child routes (e.g., Dashboard) */}
    </Layout>
  );
};

export default ProtectedLayout;