// In frontend/src/pages/JoinGroup.jsx

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Use hooks for routing
import axios from 'axios';
import styles from './JoinGroup.module.css'; // Use CSS Modules
import { IoArrowBack } from 'react-icons/io5'; // Web-friendly icon

// API_BASE_URL is replaced by the VITE_API_URL environment variable

function JoinGroup() {
    // Get groupId from URL parameters using useParams hook
    const { groupId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        passportPhotograph: '', // Placeholder URL
        chosenNumber: '',
        accountNumber: '',
        bankName: '',
        accountName: '',
    });

    const handleChange = (e) => {
        // Use event.target.name and event.target.value for web input fields
        setFormData(prevData => ({
            ...prevData,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default browser form submission
        setLoading(true);

        // 1. Auth Check (AsyncStorage replaced by localStorage)
        const userInfoJSON = localStorage.getItem('user');
        if (!userInfoJSON) {
            window.alert('Error: You must be logged in to send a request!');
            navigate('/login');
            setLoading(false);
            return;
        }
        const userInfo = JSON.parse(userInfoJSON);

        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`,
            },
        };

        const requestData = {
            ...formData,
            groupId: groupId, // Attach the group ID from params
        };

        try {
            // 2. Send the request to the backend
            // API_BASE_URL is replaced by VITE_API_URL and /api/ is added
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/requests`,
                requestData,
                config
            );

            // 3. Success: Show popup and navigate home
            window.alert('Success: Request sent successfully! The admin will review it.');
            navigate('/'); // Navigate to the Home route
        } catch (error) {
            const message = error.response?.data?.message
                || 'Failed to send request. Check server connection.';
            
            window.alert(`Error sending request: ${message}`);
            console.error('Error sending join request:', error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        // SafeAreaView and ScrollView replaced by standard div and form
        <div className={styles.pageContainer}>
            <Link to={`/group/${groupId}`} className={styles.backButton}>
                <IoArrowBack /> Back to Dashboard
            </Link>

            <h2 className={styles.header}>Join Group</h2>
            <p className={styles.subHeader}>
                You are requesting to join group ID: **{groupId}**
            </p>

            {/* --- Form Inputs (View replaced by form) --- */}
            <form className={styles.form} onSubmit={handleSubmit}>
                
                {/* Full Name */}
                <input
                    className={styles.formInput}
                    type="text"
                    name="fullName"
                    placeholder="Full name"
                    onChange={handleChange}
                    value={formData.fullName}
                    required
                />
                {/* Phone Number */}
                <input
                    className={styles.formInput}
                    type="tel"
                    name="phoneNumber"
                    placeholder="Phone number"
                    onChange={handleChange}
                    value={formData.phoneNumber}
                    required
                />
                {/* Passport Photograph (Text Placeholder) */}
                <input
                    className={styles.formInput}
                    type="url" // Use type="url" if expecting a URL
                    name="passportPhotograph"
                    placeholder="Passport photograph (enter URL for now)"
                    onChange={handleChange}
                    value={formData.passportPhotograph}
                />
                {/* Chosen Number */}
                <input
                    className={styles.formInput}
                    type="number" // keyboardType="numeric" equivalent
                    name="chosenNumber"
                    placeholder="Number you are choosing for Payout"
                    onChange={handleChange}
                    value={formData.chosenNumber}
                    required
                />
                {/* Account Number */}
                <input
                    className={styles.formInput}
                    type="text" // Keep as text to avoid issues with leading zeros
                    name="accountNumber"
                    placeholder="Account number for Payout"
                    onChange={handleChange}
                    value={formData.accountNumber}
                    required
                />
                {/* Bank Name */}
                <input
                    className={styles.formInput}
                    type="text"
                    name="bankName"
                    placeholder="Bank Name"
                    onChange={handleChange}
                    value={formData.bankName}
                    required
                />
                {/* Account Name */}
                <input
                    className={styles.formInput}
                    type="text"
                    name="accountName"
                    placeholder="Account Name"
                    onChange={handleChange}
                    value={formData.accountName}
                    required
                />
                
                {/* Submit Button (TouchableOpacity replaced by button) */}
                <button 
                    type="submit"
                    className={`${styles.submitBtn} ${loading ? styles.buttonDisabled : ''}`}
                    disabled={loading}
                >
                    {loading ? (
                        <span className={styles.loadingIndicator}>Sending...</span> // ActivityIndicator replaced
                    ) : (
                        <span>SEND JOIN REQUEST</span>
                    )}
                </button>
            </form>
        </div>
    );
}

export default JoinGroup;