// In frontend/src/pages/CreateGroup.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Use useNavigate for web navigation
import styles from './CreateGroup.module.css'; // Use CSS Modules
import { IoArrowBack } from 'react-icons/io5'; // Using a web-friendly icon library

// NOTE: API_BASE_URL is replaced by using the Vite environment variable:
// import.meta.env.VITE_API_URL

function CreateGroup() {
    // Replaced 'navigation' prop with the 'useNavigate' hook
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        groupName: '',
        payoutAmount: '',
        startingDate: '',
        contributionAmount: '',
        numberOfMembers: '',
        phoneNumber: '',
        adminChosenNumber: '',
        corporateAccount: '',
        bankName: '',
        accountName: '',
        payoutInterval: '',
        payoutTime: '',
    });

    // We use a single event handler for all inputs now, leveraging the 'name' attribute
    const handleChange = (e) => {
        setFormData(prevData => ({
            ...prevData,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        // Prevent default form submission behavior
        e.preventDefault(); 
        setLoading(true);

        // 1. Auth Check (AsyncStorage replaced by localStorage)
        const userInfoJSON = localStorage.getItem('user');
        if (!userInfoJSON) {
            window.alert('Error: You must be logged in to create a group!'); // Alert replaced by window.alert
            navigate('/login'); // Use react-router-dom navigation
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

        try {
            // 2. Send data to the backend
            // NOTE: API_BASE_URL is replaced by VITE_API_URL and /groups is added
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/groups`,
                formData,
                config
            );

            window.alert('Success: Group created successfully!');
            navigate('/'); // Redirect to home page
        } catch (error) {
            const message = error.response?.data?.message
                || 'Failed to create group. Check server connection.';
            
            window.alert(`Error creating group: ${message}`);
            console.error('Error creating group:', error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    // <SafeAreaView> and <ScrollView> replaced by standard <div> and <form>
    return (
        <div className={styles.pageContainer}>
             {/* Add a back button for better web UX */}
            <button onClick={() => navigate(-1)} className={styles.backButton}>
                <IoArrowBack /> Back
            </button>

            <h2 className={styles.header}>
                Create a Group as an <span className={styles.adminSpan}>Admin</span>
            </h2>

            {/* <ScrollView> replaced by a standard HTML <form> */}
            <form className={styles.form} onSubmit={handleSubmit}>
                
                {/* Each TextInput is replaced by a labeled <input> */}
                {/* Group Name */}
                <input
                    className={styles.formInput}
                    type="text"
                    name="groupName"
                    placeholder="Group name"
                    onChange={handleChange}
                    value={formData.groupName}
                    required
                />
                {/* Payout Amount */}
                <input
                    className={styles.formInput}
                    type="number" // keyboardType="numeric" equivalent
                    name="payoutAmount"
                    placeholder="Payout amount (e.g., 500000)"
                    onChange={handleChange}
                    value={formData.payoutAmount}
                    required
                />
                {/* Starting Date */}
                <input
                    className={styles.formInput}
                    type="date" // Use date type for better UX
                    name="startingDate"
                    onChange={handleChange}
                    value={formData.startingDate}
                    required
                />
                {/* Contribution Amount */}
                <input
                    className={styles.formInput}
                    type="number"
                    name="contributionAmount"
                    placeholder="Contribution Amount (e.g., 50000)"
                    onChange={handleChange}
                    value={formData.contributionAmount}
                    required
                />
                {/* No of members */}
                <input
                    className={styles.formInput}
                    type="number"
                    name="numberOfMembers"
                    placeholder="No of members (e.g., 10)"
                    onChange={handleChange}
                    value={formData.numberOfMembers}
                    required
                />
                {/* Contact Phone Number */}
                <input
                    className={styles.formInput}
                    type="tel"
                    name="phoneNumber"
                    placeholder="Contact phone number"
                    onChange={handleChange}
                    value={formData.phoneNumber}
                    required
                />
                {/* Admin Chosen Number */}
                <input
                    className={styles.formInput}
                    type="number"
                    name="adminChosenNumber"
                    placeholder="Your chosen payout number (e.g., 1)"
                    onChange={handleChange}
                    value={formData.adminChosenNumber}
                    required
                />
                {/* Corporate Account */}
                <input
                    className={styles.formInput}
                    type="text" // Assuming this is an account number/IBAN
                    name="corporateAccount"
                    placeholder="Account to be paid to (Corporate Acct)"
                    onChange={handleChange}
                    value={formData.corporateAccount}
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
                {/* Payout Interval */}
                <input
                    className={styles.formInput}
                    type="number"
                    name="payoutInterval"
                    placeholder="Payout Interval (in days, e.g., 30)"
                    onChange={handleChange}
                    value={formData.payoutInterval}
                    required
                />
                {/* Payout Time */}
                <input
                    className={styles.formInput}
                    type="text"
                    name="payoutTime"
                    placeholder="Payout Time (e.g., 3:00pm)"
                    onChange={handleChange}
                    value={formData.payoutTime}
                    required
                />
                
                {/* Submit Button (TouchableOpacity replaced by <button>) */}
                <button
                    type="submit"
                    className={`${styles.submitBtn} ${loading ? styles.buttonDisabled : ''}`}
                    disabled={loading}
                >
                    {loading ? (
                        <div className={styles.loadingIndicator}>Loading...</div> // ActivityIndicator replaced
                    ) : (
                        <span>CREATE</span>
                    )}
                </button>
            </form>
        </div>
    );
}

export default CreateGroup;