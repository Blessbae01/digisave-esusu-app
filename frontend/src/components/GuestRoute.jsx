// In frontend/src/components/GuestRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

function GuestRoute() {
  const userInfo = JSON.parse(localStorage.getItem('user'));

  if (userInfo) {
    // If logged in, redirect them to the Home page
    return <Navigate to="/" replace />;
  }

  // If not logged in, show the component (Login/Signup)
  return <Outlet />;
}

export default GuestRoute;