// In frontend/src/pages/Login.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Web navigation
import axios from 'axios';

// --- STYLESHEET (Converted from React Native StyleSheet) ---
// Note: In real web React, use CSS Modules instead of this object structure.
const webStyles = {
    // Equivalent to scrollContainer and pageContainer combined, setting max-width and centering
    pageContainer: {
        flexGrow: 1,
        backgroundColor: '#fff',
        padding: '24px',
        paddingTop: '60px', 
        maxWidth: '450px',
        margin: '0 auto',
        minHeight: '100vh',
    },

    // === BRANDING HEADER AREA ===
    brandingHeader: {
        alignItems: 'center',
        marginBottom: '40px',
        textAlign: 'center', // Added for web centering
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
    },
    appDescription: {
        fontSize: '15px',
        color: '#666',
        textAlign: 'center',
        lineHeight: 1.5, // Converted from 22px to unitless line height
    },

    // Form Structure
    inputGroup: {
        marginBottom: '20px',
    },
    label: {
        fontSize: '14px',
        fontWeight: 600,
        color: '#333',
        marginBottom: '5px',
        display: 'block', // Added for web input layout
    },

    // Input Fields Styling
    formInput: {
        width: '100%',
        padding: '14px 16px', // Converted from paddingVertical/Horizontal
        fontSize: '16px',
        color: '#333',
        backgroundColor: '#f7f7f7',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        boxSizing: 'border-box', // Crucial for padding/width calculation
    },
    
    // Submit Button Styling
    submitBtn: {
        backgroundColor: '#008f39', 
        padding: '16px',
        borderRadius: '8px',
        textAlign: 'center', // Replaces alignItems: 'center'
        marginTop: '20px',
        border: 'none', // Removed default browser button border
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

    // Bottom Link (Sign Up / Log In)
    bottomLink: {
        display: 'flex', // Replaces flexDirection: 'row'
        justifyContent: 'center',
        marginTop: '20px',
        fontSize: '15px',
    },
    linkText: {
        color: '#008f39',
        fontWeight: 'bold',
        textDecoration: 'none', // Replaces textDecorationLine: 'none'
    }
};

// --- REACT COMPONENT ---

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent default form submission
        
        if (!email || !password) {
            window.alert("Error: Please enter both email and password.");
            return;
        }

        setLoading(true);

        try {
            // 1. Send data to the Node.js backend
            // API_BASE_URL is replaced by VITE_API_URL and /api/ is added
            const API_URL = import.meta.env.VITE_API_URL;
            const response = await axios.post(`${API_URL}/api/users/login`, { email, password });

            const user = response.data;
            
            // 2. Save user info (token, ID, name) using localStorage
            localStorage.setItem('user', JSON.stringify(user));

            window.alert("Success: Login successful!");

            // 3. Navigate to the Home Screen using React Router
            navigate('/'); 
        } catch (err) {
            const message = err.response?.data?.message
                || 'Login failed. Check server connection.';
            
            window.alert(`Login Failed: ${message}`);
            console.error("Login Error:", err.response);
        } finally {
            setLoading(false);
        }
    };

    return (
        // ScrollView replaced by a standard div, wrapped by the form element
        <div style={webStyles.pageContainer}>
            <form onSubmit={handleLogin}>
                
                {/* --- BRANDING HEADER --- */}
                <div style={webStyles.brandingHeader}>
                    <h1 style={webStyles.appName}>DigiSave</h1> {/* Text -> h1 */}
                    <p style={webStyles.introMessage}>Welcome Back! (Login)</p> {/* Text -> p */}
                    <p style={webStyles.appDescription}> {/* Text -> p */}
                          Log in to manage your rotating savings groups and financial goals securely.
                    </p>
                </div>

                {/* Email Input */}
                <div style={webStyles.inputGroup}>
                    <label htmlFor="email" style={webStyles.label}>Email</label> {/* Text -> label */}
                    <input
                        id="email"
                        style={webStyles.formInput}
                        type="email" // Use standard web type
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} // Web way to handle text input
                        autoCapitalize="none"
                        required
                    />
                </div>

                {/* Password Input */}
                <div style={webStyles.inputGroup}>
                    <label htmlFor="password" style={webStyles.label}>Password</label>
                    <input
                        id="password"
                        style={webStyles.formInput}
                        type="password" // secureTextEntry -> type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                
                {/* Login Button */}
                <button 
                    style={{...webStyles.submitBtn, ...(loading ? webStyles.buttonDisabled : {})}}
                    type="submit" // Set type to submit for the form
                    disabled={loading}
                >
                    <span style={webStyles.buttonText}> {/* Text -> span */}
                        {loading ? 'Logging In...' : 'Log In'}
                    </span>
                </button>

                {/* Don't have an account? Link */}
                <div style={webStyles.bottomLink}>
                    <p>Don't have an account? </p> {/* Text -> p */}
                    {/* TouchableOpacity replaced by Link component */}
                    <Link to="/signup" style={webStyles.linkText}>
                        Sign Up
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default Login;