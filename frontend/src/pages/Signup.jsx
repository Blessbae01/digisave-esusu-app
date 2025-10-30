// In frontend/src/pages/Signup.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Auth.module.css'; // Import our new CSS module

function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    bvn: '',
    email: '',
    password: '',
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

    try {
      const response = await axios.post(
        '${import.meta.env.VITE_API_URL}/api/users/register',
        formData
      );
      
      console.log('User registered successfully!', response.data);
      alert('Signup successful! Please log in.');
      navigate('/login'); // Redirect to login page

    } catch (error) {
      console.error('Error during registration:', error.response ? error.response.data : error.message);
      alert('Error: ' + (error.response?.data?.message || 'Signup failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.header}>Create Account</h2>
      <p className={styles.subHeader}>Join a trusted savings community.</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className={styles.formInput}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className={styles.formInput}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            className={styles.formInput}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>BVN (Bank Verification Number)</label>
          <input
            type="text"
            name="bvn"
            value={formData.bvn}
            onChange={handleChange}
            required
            minLength="11"
            maxLength="11"
            placeholder="11-digit BVN"
            className={styles.formInput}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={styles.formInput}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className={styles.formInput}
          />
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <p className={styles.bottomLink}>
        Already have an account? <Link to="/login">Log In</Link>
      </p>
    </div>
  );
}

export default Signup;