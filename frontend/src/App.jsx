import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';

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
    <>
    <div className="main-content">
    <Navbar /> {/* <-- 3. Add Navbar here */}
      {/* The <nav> bar will eventually go here, above the <Routes> */}
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        {/* <Route path="/login" element={<Login />} /> */}
        {/* <Route path="/signup" element={<Signup />} /> */}
        {/* <Route path="/create-group" element={<CreateGroup />} /> */}

        {/* For now, let's just add a temporary route */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} /> 
        <Route path="/" element={<Home />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/join/:groupId" element={<JoinGroup />} />
        <Route path="/group/:groupId" element={<GroupDashboard />} />
        <Route path="/group/:groupId/requests" element={<ViewRequests />} />
        <Route path="/group/:groupId/contribute" element={<Contribute />} />
        <Route path="/group/:groupId/alerts" element={<Alerts />} />
      </Routes>
      </div>

      {/* 2. The Navbar is now separate from the content */}
      <Navbar />
    </>
  );
}

export default App;