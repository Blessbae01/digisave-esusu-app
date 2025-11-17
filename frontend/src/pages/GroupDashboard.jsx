// In frontend/src/pages/GroupDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './GroupDashboard.module.css'; // Use CSS Modules
import { IoWarning, IoLogOutOutline, IoArrowBack } from 'react-icons/io5'; // Web-friendly icons

// Assuming API_BASE_URL is handled via VITE_API_URL environment variable

/**
 * Helper function for rendering History Tables.
 * Converted to return an HTML <table> structure.
 */
function renderHistoryTable(title, data = [], showMember = false) {
    // Determine the column count for colspan
    const colSpan = showMember ? 4 : 3;

    return (
        <div className={styles.tableContainer}>
            <h3 className={styles.sectionHeader}>{title}</h3>
            <table className={styles.historyTable}>
                <thead>
                    <tr className={styles.tableRowHeader}>
                        {showMember && <th className={styles.tableHeaderCell}>Member Name</th>}
                        <th className={styles.tableHeaderCell}>Amount</th>
                        <th className={styles.tableHeaderCell}>Date</th>
                        {!showMember && <th className={styles.tableHeaderCell}>Method</th>}
                    </tr>
                </thead>
                <tbody>
                    {(data || []).length === 0 ? (
                        <tr>
                            <td colSpan={colSpan} className={styles.tableEmptyCell}>
                                {`No ${title.toLowerCase().includes('my') ? 'contributions' : 'history'} yet.`}
                            </td>
                        </tr>
                    ) : (
                        (data || []).map((item, index) => (
                            <tr
                                key={item && item._id ? item._id : index}
                                className={`${styles.tableRow} ${index % 2 === 0 ? styles.tableRowEven : ''}`}
                            >
                                {showMember && (
                                    <td className={styles.tableCell}>
                                        {item && item.user ? `${item.user.firstName} ${item.user.lastName}` : 'N/A'}
                                    </td>
                                )}
                                <td className={styles.tableCell}>
                                    ₦{(item && typeof item.amount === 'number' ? item.amount : 0).toLocaleString()}
                                </td>
                                <td className={styles.tableCell}>
                                    {item && item.createdAt
                                        ? new Date(item.createdAt).toLocaleDateString(undefined, {
                                              month: 'short',
                                              day: 'numeric',
                                          })
                                        : 'N/A'}
                                </td>
                                {!showMember && <td className={styles.tableCell}>{item && item.method ? item.method : 'N/A'}</td>}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

function GroupDashboard() {
    // Get groupId from URL parameters
    const { groupId } = useParams();
    const navigate = useNavigate();

    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isNonMember, setIsNonMember] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [groupBalance, setGroupBalance] = useState(0);
    const [userBalance, setUserBalance] = useState(0);
    const [groupHistory, setGroupHistory] = useState([]);
    const [myHistory, setMyHistory] = useState([]);
    const [userInfo, setUserInfo] = useState(null);


    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const handleLogout = () => {
        localStorage.removeItem('user'); // AsyncStorage replaced with localStorage
        window.alert('Logged Out: You have been logged out.'); // Alert replaced with window.alert
        navigate('/login');
    };

    // --- Main Data Fetching Logic ---
    useEffect(() => {
        const fetchGroupDetails = async () => {
            let user = null;
            try {
                // AsyncStorage replaced with localStorage
                const storedUserJSON = localStorage.getItem('user'); 
                if (!storedUserJSON || !groupId) {
                    if (!storedUserJSON) navigate('/login');
                    return;
                }
                user = JSON.parse(storedUserJSON);
                setUserInfo(user);

                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                // API_BASE_URL is replaced by VITE_API_URL and /api/ is added
                const API_URL = import.meta.env.VITE_API_URL; 

                // Fetch data in parallel
                const [groupRes, balanceRes, myBalanceRes, historyRes, myHistoryRes] = await Promise.all([
                    axios.get(`${API_URL}/api/groups/${groupId}`, config),
                    axios.get(`${API_URL}/api/contributions/group/${groupId}/total`, config),
                    axios.get(`${API_URL}/api/contributions/group/${groupId}/my-balance`, config),
                    axios.get(`${API_URL}/api/contributions/group/${groupId}/history`, config),
                    axios.get(`${API_URL}/api/contributions/group/${groupId}/my-history`, config),
                ]);

                const groupData = groupRes.data;
                setGroup(groupData);
                setGroupBalance(balanceRes.data.totalBalance || 0);
                setUserBalance(myBalanceRes.data.myBalance || 0);
                setGroupHistory(historyRes.data || []);
                setMyHistory(myHistoryRes.data || []);

                // Check user's role in this group
                if (groupData.admin && user && groupData.admin._id === user._id) {
                    setIsAdmin(true);
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching group details:', err.response ? err.response.data : err.message);

                const status = err.response ? err.response.status : null;

                // CRITICAL CHECK FOR 403 STATUS (Non-Member Block)
                if (status === 403) {
                    setIsNonMember(true);
                    setLoading(false);
                    setError(null);
                    return;
                }

                setError('Failed to load group details or insufficient permissions.');
                setLoading(false);
            }
        };
        fetchGroupDetails();
    }, [groupId, navigate]); // Add navigate to dependency array

    // Safe Username Extraction
    const userName = userInfo && userInfo.firstName && userInfo.lastName ? `${userInfo.firstName} ${userInfo.lastName}` : 'Member';

    // --- RENDER GUARDS ---
    if (loading) {
        return (
            <div className={`${styles.fullScreen} ${styles.centerContent}`}>
                <IoWarning size={32} color="#008f39" />
                <p>Loading dashboard...</p>
            </div>
        );
    }
    if (error) return <div className={styles.fullScreen}><p className={styles.errorText}>Error: {error}</p></div>;

    // --- RENDER FOR NON-MEMBER (403 Error) ---
    if (isNonMember) {
        return (
            // SafeAreaView/MobileNavbar removed, replaced with standard web layout
            <div className={`${styles.pageContainer} ${styles.centerContent} ${styles.fullScreen}`}>
                <div className={styles.joinBox}>
                    <h3 className={styles.joinBoxHeader}>Join Group</h3>
                    <p className={styles.joinBoxText}>You are not yet a member of this savings group.</p>

                    {/* TouchableOpacity replaced by Link */}
                    <Link to={`/join/${groupId}`} className={styles.joinBtn}>
                        Request to Join Group
                    </Link>
                </div>
            </div>
        );
    }
    // --- END NON-MEMBER RENDER ---

    return (
        // SafeAreaView/ScrollView replaced by standard HTML div and scrollable container
        <div className={styles.pageContainer}>
            <h2 className={styles.header}>
                Group Dashboard ({userName})
                {isAdmin && <span className={styles.adminSpan}>(Admin)</span>}
            </h2>

            {/* --- Balance Box --- (View replaced by div) */}
            <div className={styles.balanceBox}>
                <p className={styles.balanceLabel}>Contribution Balance</p>
                <p className={styles.balanceAmount}>₦{Number(groupBalance || 0).toLocaleString()}</p>
                <p className={`${styles.balanceLabel} ${styles.balanceLabelMargin}`}>Your Balance</p>
                <p className={styles.balanceAmount}>₦{Number(userBalance || 0).toLocaleString()}</p>
            </div>

            {/* --- Action Links --- (View replaced by div) */}
            <div className={styles.actionLinks}>
                {isAdmin && (
                    // TouchableOpacity replaced by Link
                    <Link to={`/group/${groupId}/requests`} className={`${styles.actionLink} ${styles.adminLink}`}>
                        View Requests
                    </Link>
                )}
                <Link to={`/group/${groupId}/alerts`} className={styles.actionLink}>
                    Alerts
                </Link>
                <Link to={`/group/${groupId}/contribute`} className={styles.actionLink}>
                    Contribute
                </Link>
            </div>

            {/* --- Group Details Card --- (View replaced by div) */}
            <div className={styles.groupDetailsCard}>
                <h3 className={styles.cardHeader}>{group ? group.groupName : 'Group'}</h3>
                <div className={styles.cardBody}>
                    <div className={styles.cardRow}>
                        <p className={styles.cardLabel}>Payout</p>
                        <p className={styles.cardValue}>₦{group?.payoutAmount ? Number(group.payoutAmount).toLocaleString() : '0'}</p>
                    </div>
                    <div className={styles.cardRow}>
                        <p className={styles.cardLabel}>Contribution</p>
                        <p className={styles.cardValue}>₦{group?.contributionAmount ? Number(group.contributionAmount).toLocaleString() : '0'}</p>
                    </div>
                    <div className={styles.cardRow}>
                        <p className={styles.cardLabel}>Starts</p>
                        <p className={styles.cardValue}>{group ? formatDate(group.startingDate) : 'N/A'}</p>
                    </div>
                    <div className={styles.cardRow}>
                        <p className={styles.cardLabel}>Interval</p>
                        <p className={styles.cardValue}>{group?.payoutInterval ? `${group.payoutInterval} Days` : 'N/A'}</p>
                    </div>
                    <div className={styles.cardRow}>
                        <p className={styles.cardLabel}>Members</p>
                        <p className={styles.cardValue}>
                            {group?.members ? `${group.members.length} / ${group.numberOfMembers || 0}` : '0 / 0'}
                        </p>
                    </div>
                    <div className={styles.cardRow}>
                        <p className={styles.cardLabel}>Slots Left</p>
                        <p className={styles.cardValue}>{group?.availableNumbers ? group.availableNumbers.length : 0}</p>
                    </div>
                </div>
            </div>

            {/* --- Member List --- */}
            <div className={styles.memberListSection}>
                <h3 className={styles.sectionHeader}>Members</h3>
                <div className={styles.memberList}>
                    {(group?.members || []).map((member, index) => (
                        <div key={member?._id || index} className={styles.memberListItem}>
                            <div className={styles.memberInfo}>
                                <p className={styles.memberText}>
                                    {index + 1}. {member?.user ? `${member.user.firstName} ${member.user.lastName}` : 'N/A'}
                                    <span className={styles.memberChosenNum}> (Num: {member?.chosenNumber || 'N/A'})</span>
                                </p>
                            </div>
                            {member?.user && group?.admin && member.user._id === group.admin._id && (
                                <span className={styles.adminTag}>Admin</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* --- History Tables --- (Rendered using the helper function) */}
            {renderHistoryTable('Contribution History (All)', groupHistory, true)}
            {renderHistoryTable('My History', myHistory, false)}

            {/* --- Logout Button --- (TouchableOpacity replaced by button) */}
            <button onClick={handleLogout} className={styles.logoutBtn}>
                <IoLogOutOutline style={{ marginRight: 8 }} />
                Log Out
            </button>
        </div>
        // MobileNavbar removed as it's not a standard web component
    );
}

export default GroupDashboard;