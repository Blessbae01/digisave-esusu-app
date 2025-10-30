// In frontend/src/pages/ViewRequests.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './ViewRequests.module.css'; // Import our new CSS module
import { IoArrowBack } from 'react-icons/io5'; // Import back icon

function ViewRequests() {
  const { groupId } = useParams();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null); // To disable buttons
  
  const userInfo = JSON.parse(localStorage.getItem('user'));

  // Function to fetch all pending requests
  const fetchRequests = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get(
        `http://localhost:5000/api/requests/group/${groupId}`,
        config
      );
      setRequests(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load requests. Are you the admin?');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userInfo) {
      setError('You must be logged in.');
      setLoading(false);
      return;
    }
    fetchRequests();
  }, [groupId, userInfo.token]);

  // Function to handle ACCEPTING a request
  const handleAccept = async (requestId) => {
    setProcessingId(requestId);
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      await axios.put(
        `http://localhost:5000/api/requests/${requestId}/approve`,
        {},
        config
      );
      
      alert('Member approved!');
      // Refresh the list by filtering out the approved request
      setRequests(requests.filter((req) => req._id !== requestId));
    } catch (err) {
      console.error('Error approving request:', err);
      alert('Failed to approve request.');
    } finally {
      setProcessingId(null);
    }
  };

  // Function to handle REJECTING a request
  const handleReject = async (requestId) => {
    setProcessingId(requestId);
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      await axios.put(
        `http://localhost:5000/api/requests/${requestId}/reject`,
        {},
        config
      );

      alert('Member rejected.');
      // Refresh the list by filtering out the rejected request
      setRequests(requests.filter((req) => req._id !== requestId));
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('Failed to reject request.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className={styles.pageContainer}>Loading requests...</div>;
  if (error) return <div className={styles.pageContainer}>Error: {error}</div>;

  return (
    <div className={styles.pageContainer}>
      <Link to={`/group/${groupId}`} className={styles.backButton}>
        <IoArrowBack /> Back to Dashboard
      </Link>
      
      <h2 className={styles.header}>View Requests to Join</h2>
      
      {requests.length === 0 ? (
        <p className={styles.noRequests}>No pending requests.</p>
      ) : (
        <div>
          {requests.map((req) => (
            <div key={req._id} className={styles.requestCard}>
              <h4 className={styles.cardHeader}>
                {req.fullName}
              </h4>
              <div className={styles.cardInfo}>
                <p><strong>Email:</strong> {req.user.email}</p>
                <p><strong>Phone:</strong> {req.phoneNumber}</p>
                <p><strong>Wants Number:</strong> {req.chosenNumber}</p>
                <p><strong>Bank:</strong> {req.bankName}</p>
                <p><strong>Account:</strong> {req.accountNumber} ({req.accountName})</p>
              </div>
              
              <div className={styles.actions}>
                <button 
                  onClick={() => handleAccept(req._id)} 
                  className={styles.acceptBtn}
                  disabled={processingId === req._id}
                >
                  {processingId === req._id ? 'Accepting...' : 'Accept'}
                </button>
                <button 
                  onClick={() => handleReject(req._id)} 
                  className={styles.rejectBtn}
                  disabled={processingId === req._id}
                >
                  {processingId === req._id ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ViewRequests;