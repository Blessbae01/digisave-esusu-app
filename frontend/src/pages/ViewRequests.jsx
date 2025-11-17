// In frontend/src/pages/ViewRequests.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './ViewRequests.module.css'; // Use CSS Modules
import { IoArrowBack, IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5'; // Web icons

// API_BASE_URL is replaced by VITE_API_URL environment variable

function ViewRequests() {
    // Get groupId from URL parameters using useParams hook
    const { groupId } = useParams();
    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingId, setProcessingId] = useState(null);
    
    const [userInfo, setUserInfo] = useState(null);

    // Function to fetch all pending requests
    const fetchRequests = async (user) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            // Use VITE_API_URL and include /api/
            const API_URL = import.meta.env.VITE_API_URL;

            const { data } = await axios.get(
                `${API_URL}/api/requests/group/${groupId}`,
                config
            );
            setRequests(data);
            
        } catch (err) {
            console.error('Error fetching requests:', err.response ? err.response.data : err.message);
            setError('Failed to load requests. Are you the admin?');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadUserAndFetch = async () => {
            // AsyncStorage replaced with localStorage
            const storedUserJSON = localStorage.getItem('user');
            if (!storedUserJSON) {
                setError('You must be logged in.');
                navigate('/login');
                return;
            }
            const user = JSON.parse(storedUserJSON);
            setUserInfo(user);
            
            if (groupId) {
                fetchRequests(user);
            } else {
                setError('Missing Group ID.');
                setLoading(false);
            }
        };
        loadUserAndFetch();
    }, [groupId, navigate]); 

    // Function to handle ACCEPTING a request
    const handleAccept = async (requestId) => {
        setProcessingId(requestId);
        try {
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
            };
            const API_URL = import.meta.env.VITE_API_URL;
            
            await axios.put(
                `${API_URL}/api/requests/${requestId}/approve`,
                {},
                config
            );
            
            window.alert('Success: Member approved and added to group!'); // Alert replaced
            // Refresh the list by filtering out the approved request
            setRequests(requests.filter((req) => req._id !== requestId));
        } catch (err) {
            console.error('Error approving request:', err.response ? err.response.data : err.message);
            window.alert('Approval Failed: Failed to approve request.');
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
            const API_URL = import.meta.env.VITE_API_URL;
            
            await axios.put(
                `${API_URL}/api/requests/${requestId}/reject`,
                {},
                config
            );

            window.alert('Success: Member rejected.'); // Alert replaced
            // Refresh the list by filtering out the rejected request
            setRequests(requests.filter((req) => req._id !== requestId));
        } catch (err) {
            console.error('Error rejecting request:', err.response ? err.response.data : err.message);
            window.alert('Rejection Failed: Failed to reject request.');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className={`${styles.fullScreen} ${styles.centerContent}`}>
                <div className={styles.loadingIndicator}>Loading requests...</div>
            </div>
        );
    }
    if (error) return <div className={styles.fullScreen}><p className={styles.errorText}>Error: {error}</p></div>;

    return (
        // SafeAreaView/ScrollView replaced by standard div
        <div className={styles.pageContainer}>
            
            {/* Back Button (TouchableOpacity replaced by Link) */}
            <Link to={`/group/${groupId}`} className={styles.backButton}>
                <IoArrowBack size={20} />
                <span className={styles.backButtonText}>Back to Dashboard</span>
            </Link>
            
            <h2 className={styles.header}>View Requests to Join</h2>
            
            {requests.length === 0 ? (
                <p className={styles.noRequests}>No pending requests.</p>
            ) : (
                <div>
                    {requests.map((req) => (
                        <div key={req._id} className={styles.requestCard}>
                            <h3 className={styles.cardHeader}>
                                {req.fullName}
                            </h3>
                            <div className={styles.cardInfo}>
                                {/* Display Request Details */}
                                <p className={styles.cardInfoText}><span className={styles.cardInfoLabel}>Email:</span> {req.user ? req.user.email : 'N/A'}</p>
                                <p className={styles.cardInfoText}><span className={styles.cardInfoLabel}>Phone:</span> {req.phoneNumber}</p>
                                <p className={styles.cardInfoText}><span className={styles.cardInfoLabel}>Wants Number:</span> {req.chosenNumber}</p>
                                <p className={styles.cardInfoText}><span className={styles.cardInfoLabel}>Bank:</span> {req.bankName}</p>
                                <p className={styles.cardInfoText}><span className={styles.cardInfoLabel}>Account:</span> {req.accountNumber} ({req.accountName})</p>
                            </div>
                            
                            <div className={styles.actions}>
                                {/* Accept Button (TouchableOpacity replaced by button) */}
                                <button 
                                    onClick={() => handleAccept(req._id)} 
                                    className={`${styles.actionBtn} ${styles.acceptBtn} ${processingId === req._id ? styles.actionBtnDisabled : ''}`}
                                    disabled={processingId === req._id}
                                >
                                    <IoCheckmarkCircle size={18} style={{marginRight: 5}}/>
                                    <span>
                                        {processingId === req._id ? 'Accepting...' : 'Accept'}
                                    </span>
                                </button>
                                {/* Reject Button (TouchableOpacity replaced by button) */}
                                <button 
                                    onClick={() => handleReject(req._id)} 
                                    className={`${styles.actionBtn} ${styles.rejectBtn} ${processingId === req._id ? styles.actionBtnDisabled : ''}`}
                                    disabled={processingId === req._id}
                                >
                                    <IoCloseCircle size={18} style={{marginRight: 5}}/>
                                    <span>
                                        {processingId === req._id ? 'Rejecting...' : 'Reject'}
                                    </span>
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