// In frontend/src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// 1. Import our new route handlers
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';

// 2. Import ALL your pages
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import CreateGroup from './pages/CreateGroup';
import JoinGroup from './pages/JoinGroup';
import GroupDashboard from './pages/GroupDashboard';
import ViewRequests from './pages/ViewRequests';
import Contribute from './pages/Contribute';
import Alerts from './pages/Alerts';

import './App.css';

function App() {
  return (
    <Routes>

      {/* --- Guest Routes (Only for logged-out users) --- */}
      {/* This route renders the GuestRoute component.
          If you are logged out, it shows the <Outlet/>, 
          which will be <Login/> or <Signup/>.
      */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* --- Protected Routes (Only for logged-in users) --- */}
      {/* This route renders the ProtectedRoute component.
          If you are logged in, it shows the <Outlet/> (and Navbar),
          which will be one of the child routes below.
      */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/join/:groupId" element={<JoinGroup />} />
        <Route path="/group/:groupId" element={<GroupDashboard />} />
        <Route path="/group/:groupId/requests" element={<ViewRequests />} />
        <Route path="/group/:groupId/contribute" element={<Contribute />} />
        <Route path="/group/:groupId/alerts" element={<Alerts />} />

        {/* Nav bar links */}
        <Route path="/join-group" element={<Home />} /> 
        <Route path="/more" element={<Home />} /> 
      </Route>

    </Routes>
  );
}

export default App;