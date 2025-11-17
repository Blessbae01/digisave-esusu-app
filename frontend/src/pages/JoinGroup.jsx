// In frontend/src/pages/JoinGroup.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './JoinGroup.module.css'; // Import our new CSS module

function JoinGroup() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    passportPhotograph: '', // We'll just use a placeholder text for now
    chosenNumber: '',
    accountNumber: '',
    bankName: '',
    accountName: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userInfo = JSON.parse(localStorage.getItem('user'));
    if (!userInfo || !userInfo.token) {
      alert('You must be logged in to join a group!');
      navigate('/login');
      return;
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const requestData = {
      ...formData,
      groupId: groupId,
    };

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/requests`,
        requestData,
        config
      );

      alert('Request sent successfully! The admin will review it.');
      navigate('/'); // Go back to home page
    } catch (error) {
      console.error(
        'Error sending join request:',
        error.response ? error.response.data : error.message
      );
      alert(
        'Error: ' +
          (error.response.data.message || 'Failed to send request')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.header}>Join Group</h2>
      <p className={styles.subHeader}>
        You are requesting to join group: {groupId}
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input type="text" name="fullName" placeholder="Full name" onChange={handleChange} required className={styles.formInput} />
        <input type="tel" name="phoneNumber" placeholder="Phone number" onChange={handleChange} required className={styles.formInput} />
        <input type="text" name="passportPhotograph" placeholder="Passport photograph (enter URL for now)" onChange={handleChange} className={styles.formInput} />
        <input type="number" name="chosenNumber" placeholder="Number you are choosing for Payout" onChange={handleChange} required className={styles.formInput} />
        <input type="text" name="accountNumber" placeholder="Account number for Payout" onChange={handleChange} required className={styles.formInput} />
        <input type="text" name="bankName" placeholder="Bank Name" onChange={handleChange} required className={styles.formInput} />
        <input type="text" name="accountName" placeholder="Account Name" onChange={handleChange} required className={styles.formInput} />
        
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Sending Request...' : 'SEND JOIN REQUEST'}
        </button>
      </form>
    </div>
  );
}

export default JoinGroup;