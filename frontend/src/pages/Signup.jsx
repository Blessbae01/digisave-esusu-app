// In frontend/src/pages/Signup.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Web navigation
import axios from 'axios';

// --- STYLESHEET (Converted from React Native StyleSheet) ---
const webStyles = {
    // Equivalent to scrollContainer and pageContainer combined, setting max-width and centering
    pageContainer: {
        backgroundColor: '#fff',
        padding: '24px',
        paddingTop: '60px',
        maxWidth: '450px',
        margin: '0 auto',
        minHeight: '100vh', // Ensure scrollable area on short screens
        boxSizing: 'border-box',
    },

    // === BRANDING HEADER AREA ===
    brandingHeader: {
        alignItems: 'center',
        marginBottom: '30px',
        textAlign: 'center',
    },
    appName: {
        fontSize: '34px',
        fontWeight: 900,
        color: '#008f39', 
        letterSpacing: '1px',
        marginBottom: '5px',
    },
    introMessage: {
        fontSize: '18px',
        fontWeight: 500,
        color: '#333',
        marginBottom: '8px',
        textAlign: 'center',
    },
    appDescription: {
        fontSize: '15px',
        color: '#666',
        textAlign: 'center',
        lineHeight: 1.5,
    },

    // Form Structure
    inputGroup: {
        marginBottom: '15px',
    },
    label: {
        fontSize: '14px',
        fontWeight: 600,
        color: '#333',
        marginBottom: '5px',
        display: 'block',
    },

    // Input Fields Styling
    formInput: {
        height: '50px', // Converted from fixed height
        width: '100%',
        padding: '0 16px', // Removed vertical padding as height is fixed
        fontSize: '16px',
        color: '#333',
        backgroundColor: '#f7f7f7',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        boxSizing: 'border-box',
    },
    
    // Submit Button Styling
    submitBtn: {
        backgroundColor: '#008f39',
        padding: '16px',
        borderRadius: '8px',
        textAlign: 'center',
        marginTop: '20px',
        border: 'none',
        cursor: 'pointer',
        width: '100%',
    },
    buttonDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed',
    },
    buttonText: {
        color: 'white',
        fontSize: '18px',
        fontWeight: 600,
    },

    // Bottom Link (Log In Link)
    bottomLink: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '20px',
        fontSize: '15px',
    },
    linkText: {
        color: '#008f39',
        fontWeight: 'bold',
        textDecoration: 'none',
    }
};

// --- REACT COMPONENT ---

function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        bvn: '',
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        // Use event.target.name and event.target.value for web input fields
        setFormData(prevData => ({
            ...prevData,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSignup = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setLoading(true);

        try {
            // 1. Send data to the Node.js backend
            // API_BASE_URL is replaced by VITE_API_URL and /api/ is added
            const API_URL = import.meta.env.VITE_API_URL;
            await axios.post(
                `${API_URL}/api/users/register`, 
                formData
            );

            // 2. Success: Notify user and navigate to the Login screen
            window.alert("Success: Signup successful! Please log in.");
            navigate('/login'); 

        } catch (err) {
            const message = err.response?.data?.message
                || 'Signup failed. Check all fields and try again.';
            
            window.alert(`Signup Failed: ${message}`);
            console.error("Signup Error:", err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        // ScrollView replaced by a standard div, wrapped by the form element
        <div style={webStyles.pageContainer}>
            <form onSubmit={handleSignup}>
                
                {/* --- BRANDING HEADER --- */}
                <div style={webStyles.brandingHeader}>
                    <h1 style={webStyles.appName}>DigiSave</h1>
                    <p style={webStyles.introMessage}>Create Your Account</p>
                    <p style={webStyles.appDescription}>
                        Join a trusted, KYC-verified community and start saving today to hit your financial targets.
                    </p>
                </div>

                {/* --- FORM INPUTS --- */}

                {/* First Name */}
                <div style={webStyles.inputGroup}>
                    <label htmlFor="firstName" style={webStyles.label}>First Name</label>
                    <input
                        id="firstName"
                        style={webStyles.formInput}
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Last Name */}
                <div style={webStyles.inputGroup}>
                    <label htmlFor="lastName" style={webStyles.label}>Last Name</label>
                    <input
                        id="lastName"
                        style={webStyles.formInput}
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Phone Number */}
                <div style={webStyles.inputGroup}>
                    <label htmlFor="phoneNumber" style={webStyles.label}>Phone Number</label>
                    <input
                        id="phoneNumber"
                        style={webStyles.formInput}
                        type="tel"
                        name="phoneNumber"
                        placeholder="Phone Number"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* BVN */}
                <div style={webStyles.inputGroup}>
                    <label htmlFor="bvn" style={webStyles.label}>BVN (Bank Verification Number)</label>
                    <input
                        id="bvn"
                        style={webStyles.formInput}
                        type="text" // Keep as text, use pattern/validation for 11 digits
                        name="bvn"
                        placeholder="11-digit BVN"
                        value={formData.bvn}
                        onChange={handleChange}
                        maxLength={11}
                        required
                    />
                </div>

                {/* Email */}
                <div style={webStyles.inputGroup}>
                    <label htmlFor="email" style={webStyles.label}>Email</label>
                    <input
                        id="email"
                        style={webStyles.formInput}
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Password */}
                <div style={webStyles.inputGroup}>
                    <label htmlFor="password" style={webStyles.label}>Password</label>
                    <input
                        id="password"
                        style={webStyles.formInput}
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                
                {/* Sign Up Button */}
                <button 
                    style={{...webStyles.submitBtn, ...(loading ? webStyles.buttonDisabled : {})}} 
                    type="submit"
                    disabled={loading}
                >
                    <span style={webStyles.buttonText}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </span>
                </button>

                {/* Already have an account? Link */}
                <div style={webStyles.bottomLink}>
                    <p>Already have an account? </p>
                    {/* TouchableOpacity replaced by Link component */}
                    <Link to="/login" style={webStyles.linkText}>
                        Log In
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default Signup;