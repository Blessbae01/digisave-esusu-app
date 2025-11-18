import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Auth.module.css';

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
                `${import.meta.env.VITE_API_URL}/api/users/login`,
                formData
            );

            localStorage.setItem('user', JSON.stringify(response.data));
            alert('Login successful!');
            navigate('/'); // Redirect to the home page

        } catch (error) {
            console.error('Error during login:', error.response ? error.response.data : error.message);
            alert('Error: ' + (error.response?.data?.message || 'Login failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <header className={styles.brandingHeader}>
                {/* LOGO Implementation: Using the image from the public folder */}
                <div className={styles.logoPlaceholder}>
                    <img 
                        src="/images/digisave_logo.png" 
                        alt="DigiSave Logo" 
                        className={styles.logoImage} 
                    />
                </div>
                
                <h3 className={styles.introMessage}>Welcome Back!</h3>
                <p className={styles.appDescription}>
                    Log in to manage your savings groups and financial goals securely.
                </p>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
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
                    {loading ? 'Logging In...' : 'Log In'}
                </button>
            </form>

            <p className={styles.bottomLink}>
                Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
        </div>
    );
}

export default Login;