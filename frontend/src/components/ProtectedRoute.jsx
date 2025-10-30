// In frontend/src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // Your bottom nav bar

function ProtectedRoute() {
  const userInfo = JSON.parse(localStorage.getItem('user'));

  if (!userInfo) {
    // If not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  // If LOGGED IN, render the standard layout with the Navbar
  // The <Outlet> will be replaced by the child route (e.g., <Home />)
  return (
    <>
      <div className="main-content">
        <Outlet /> 
      </div>
      <Navbar />
    </>
  );
}

export default ProtectedRoute;