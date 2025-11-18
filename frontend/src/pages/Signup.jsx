import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Auth.module.css';
import Policy from '../components/Policy.jsx'; 

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
    
    const [bvnStatus, setBvnStatus] = useState(null); 
    const [agreedToPolicy, setAgreedToPolicy] = useState(false); 

    const handleBvnChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, bvn: value }));
        setBvnStatus(null); 

        if (value.length === 11) {
            setBvnStatus('checking');
            // Simulate API latency
            setTimeout(() => {
                if (/^\d{11}$/.test(value)) {
                    setBvnStatus('verified');
                } else {
                    setBvnStatus('error');
                }
            }, 500); 
        } else if (value.length > 11) {
            setBvnStatus('error');
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!agreedToPolicy) {
            alert("You must agree to the terms and policy before signing up.");
            return;
        }

        if (bvnStatus !== 'verified') {
            alert("Please ensure your 11-digit BVN is verified.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/users/register`, 
                formData
            );
            
            alert('Signup successful! Please log in.');
            navigate('/login'); 

        } catch (error) {
            const message = error.response?.data?.message || 'Signup failed.';
            alert('Error: ' + message);
        } finally {
            setLoading(false);
        }
    };

    const getBvnMessage = () => {
        if (bvnStatus === 'verified') {
            return <span className={styles.bvnVerified}>✅ BVN Verified</span>;
        }
        if (bvnStatus === 'checking') {
            return <span className={styles.bvnChecking}>⏳ Verifying...</span>;
        }
        if (bvnStatus === 'error') {
            return <span className={styles.bvnError}>❌ BVN must be 11 digits.</span>;
        }
        return null;
    };


    return (
        <div className={styles.pageContainer}>
            <header className={styles.brandingHeader}>
                 {/* Updated Branding Block */}
                <div className={styles.logoBlock}>
                    {/* 1. Large Logo */}
                    <div className={styles.logoContainer}>
                        <img 
                            src="/images/digisave_logo.png" 
                            alt="DigiSave Logo" 
                            className={styles.logoImage} 
                        />
                    </div>
                    {/* 2. Centered Name */}
                    <span className={styles.logoName}>DIGISAVE</span>
                    {/* 3. Tiny Tagline */}
                    <span className={styles.logoTagline}>The Future of Shared Finance</span>
                </div>
                
                <h3 className={styles.introMessage}>Create Your Account</h3>
                <p className={styles.appDescription}>
                    Join a trusted, KYC-verified community and start saving today.
                </p>
            </header>
            
            <form onSubmit={handleSubmit} className={styles.form}>
                
                {/* First Name */}
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

                {/* Last Name */}
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

                {/* Phone Number */}
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

                {/* BVN INPUT (with Verification Status) */}
                <div className={styles.inputGroup}>
                    <label className={styles.label}>BVN (Bank Verification Number)</label>
                    <input
                        type="text"
                        name="bvn"
                        value={formData.bvn}
                        onChange={handleBvnChange} 
                        required
                        minLength="11"
                        maxLength="11"
                        placeholder="11-digit BVN"
                        className={styles.formInput}
                    />
                    <div className={styles.bvnStatusContainer}>
                        {getBvnMessage()} {/* Display verification status */}
                    </div>
                </div>

                {/* Email */}
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

                {/* Password */}
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
                
                {/* --- POLICY CHECKBOX --- */}
                <Policy 
                    agreed={agreedToPolicy} 
                    setAgreed={setAgreedToPolicy} 
                />
                
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