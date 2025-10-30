// In frontend/src/pages/CreateGroup.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './CreateGroup.module.css'; // Import our new CSS module

function CreateGroup() {
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
      alert('You must be logged in to create a group!');
      navigate('/login');
      return;
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    try {
      const response = await axios.post(
        'http://localhost:5000/api/groups',
        formData,
        config
      );

      console.log('Group created successfully:', response.data);
      alert('Group created successfully!');
      navigate('/'); // Redirect to home page
    } catch (error) {
      console.error(
        'Error creating group:',
        error.response ? error.response.data : error.message
      );
      alert(
        'Error: ' +
          (error.response.data.message || 'Failed to create group')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.header}>
        Create a Group as an <span>Admin</span>
      </h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input type="text" name="groupName" placeholder="Group name" onChange={handleChange} required className={styles.formInput} />
        <input type="number" name="payoutAmount" placeholder="Payout amount (e.g., 500000)" onChange={handleChange} required className={styles.formInput} />
        <input type="date" name="startingDate" placeholder="Starting date" onChange={handleChange} required className={styles.formInput} />
        <input type="number" name="contributionAmount" placeholder="Contribution Amount (e.g., 50000)" onChange={handleChange} required className={styles.formInput} />
        <input type="number" name="numberOfMembers" placeholder="No of members (e.g., 10)" onChange={handleChange} required className={styles.formInput} />
        <input type="tel" name="phoneNumber" placeholder="Contact phone number" onChange={handleChange} required className={styles.formInput} />
        <input type="number" name="adminChosenNumber" placeholder="Your chosen payout number (e.g., 1)" onChange={handleChange} required className={styles.formInput} />
        <input type="text" name="corporateAccount" placeholder="Account to be paid to (Corporate Acct)" onChange={handleChange} required className={styles.formInput} />
        <input type="text" name="bankName" placeholder="Bank Name" onChange={handleChange} required className={styles.formInput} />
        <input type="text" name="accountName" placeholder="Account Name" onChange={handleChange} required className={styles.formInput} />
        <input type="number" name="payoutInterval" placeholder="Payout Interval (in days, e.g., 30)" onChange={handleChange} required className={styles.formInput} />
        <input type="text" name="payoutTime" placeholder="Payout Time (e.g., 3:00pm)" onChange={handleChange} required className={styles.formInput} />
        
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Creating...' : 'CREATE'}
        </button>
      </form>
    </div>
  );
}

export default CreateGroup;