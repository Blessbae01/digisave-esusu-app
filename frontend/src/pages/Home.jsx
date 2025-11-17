// In frontend/src/pages/Home.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './Home.module.css'; // Use CSS Modules
import { IoAddCircleOutline, IoLogOutOutline } from 'react-icons/io5'; // Web icons

// API_BASE_URL is replaced by VITE_API_URL environment variable

function Home() {
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState(null);

    const handleLogout = () => {
        localStorage.removeItem('user'); // AsyncStorage replaced with localStorage
        window.alert("Logged Out: You have been logged out."); // Alert replaced
        navigate('/login');
    };

    useEffect(() => {
        const loadData = async () => {
            let user = null;
            try {
                // AsyncStorage replaced with localStorage
                const storedUser = localStorage.getItem('user'); 
                if (storedUser) {
                    user = JSON.parse(storedUser);
                    setUserInfo(user);
                }

                // API_BASE_URL is replaced by VITE_API_URL and /api/ is added
                const API_URL = import.meta.env.VITE_API_URL; 
                const config = user ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
                
                // Fetch groups (requires authentication header if logged in)
                const response = await axios.get(`${API_URL}/api/groups`, config);
                setGroups(response.data);

            } catch (err) {
                console.error("Group Fetch Error:", err.response ? err.response.data : err.message);
                setError("Failed to load groups. Check your network or login status.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [navigate]);

    const handleGroupClick = (groupId) => {
        if (!userInfo) {
            // Alert logic translated to use window.confirm/alert and navigate
            if (window.confirm("Please log in to view group details or request to join. Would you like to log in now?")) {
                 navigate('/login');
            }
        } else {
            // navigation.navigate('GroupDashboard', { groupId }) translated to Link or navigate
            navigate(`/group/${groupId}`);
        }
    };
    
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className={`${styles.fullScreen} ${styles.centerContent}`}>
                <div className={styles.loadingIndicator}>Loading groups...</div>
            </div>
        );
    }

    if (error) {
        return <div className={styles.fullScreen}><p className={styles.errorText}>{error}</p></div>;
    }

    return (
        // SafeAreaView and ScrollView replaced by standard div containers
        <div className={styles.pageContainer}>
            
            {/* --- MODIFIED HEADER WITH LOGOUT BUTTON --- */}
            <header className={styles.header}>
                {/* LOGOUT BUTTON (Only visible if userInfo exists) */}
                {userInfo && (
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        <IoLogOutOutline size={20} color="#d90429" />
                        <span className={styles.logoutText}>Logout</span>
                    </button>
                )}
                
                {/* CREATE GROUP BUTTON */}
                {/* TouchableOpacity replaced by Link/button */}
                <Link to="/create-group" className={styles.createGroupBtn}>
                    <IoAddCircleOutline size={20} color="white" />
                    <span className={styles.createGroupText}>Create Your Group</span>
                </Link>
            </header>

            {/* --- EXPLORE GROUPS SECTION --- */}
            <h2 className={styles.exploreHeader}>Explore Available Groups</h2>
            
            <div className={styles.groupList}>
                {groups.length === 0 ? (
                    <p className={styles.noGroupsText}>No groups available right now. Why not create one?</p>
                ) : (
                    groups.map((group) => (
                        // TouchableOpacity replaced by Link
                        <Link 
                            key={group._id} 
                            to={userInfo ? `/group/${group._id}` : '#'} // Link destination
                            onClick={(e) => {
                                // Prevent default navigation if user is not logged in
                                if (!userInfo) {
                                    e.preventDefault(); 
                                    handleGroupClick(group._id);
                                }
                            }}
                            className={styles.groupCardLink} // Added Link class for styling
                        >
                            <div className={styles.groupCard}>
                                <div className={styles.cardHeader}>
                                    <p className={styles.groupName}>{group.groupName}</p>
                                    <span className={styles.statusTag}>Active</span>
                                </div>

                                <div className={styles.cardBody}>
                                    {/* ... Card Rows ... */}
                                    <div className={styles.cardRow}>
                                        <p className={styles.cardLabel}>Payout</p>
                                        <p className={styles.cardValueAmount}>₦{group.payoutAmount.toLocaleString()}</p>
                                    </div>
                                    <div className={styles.cardRow}>
                                        <p className={styles.cardLabel}>Contribution</p>
                                        <p className={styles.cardValue}>₦{group.contributionAmount.toLocaleString()}</p>
                                    </div>
                                    <div className={styles.cardRow}>
                                        <p className={styles.cardLabel}>Starts</p>
                                        <p className={styles.cardValue}>{formatDate(group.startingDate)}</p>
                                    </div>
                                    <div className={styles.cardRow}>
                                        <p className={styles.cardLabel}>Interval</p>
                                        <p className={styles.cardValue}>{group.payoutInterval} Days</p>
                                    </div>
                                </div>

                                <div className={styles.cardFooter}>
                                    <p className={styles.membersInfo}>
                                        {group.members.length} / {group.numberOfMembers} Members
                                    </p>
                                    
                                    <p className={styles.availableNumbersText}>
                                        <span className={styles.boldText}>Not chosen yet:</span> {group.availableNumbers.join(', ')}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
            
        </div>
        // MobileNavbar removed as it's not needed for web layout
    );
}

export default Home;