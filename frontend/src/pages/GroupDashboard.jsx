// In frontend/src/pages/GroupDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './GroupDashboard.module.css'; // Import our new CSS module

function GroupDashboard() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userInfo = JSON.parse(localStorage.getItem('user'));
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [groupBalance, setGroupBalance] = useState(0);
  const [userBalance, setUserBalance] = useState(0);
  const [groupHistory, setGroupHistory] = useState([]);
  const [myHistory, setMyHistory] = useState([]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!userInfo) {
        setError('You must be logged in to view this page.');
        setLoading(false);
        return;
      }
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };
        
        // Fetch all data in parallel
        const [
          groupRes,
          balanceRes,
          myBalanceRes,
          historyRes,
          myHistoryRes
        ] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/groups/${groupId}`, config),
          axios.get(`${import.meta.env.VITE_API_URL}/api/contributions/group/${groupId}/total`, config),
          axios.get(`${import.meta.env.VITE_API_URL}/api/contributions/group/${groupId}/my-balance`, config),
          axios.get(`${import.meta.env.VITE_API_URL}/api/contributions/group/${groupId}/history`, config),
          axios.get(`${import.meta.env.VITE_API_URL}/api/contributions/group/${groupId}/my-history`, config)
        ]);

        const groupData = groupRes.data;
        setGroup(groupData);
        setGroupBalance(balanceRes.data.totalBalance);
        setUserBalance(myBalanceRes.data.myBalance);
        setGroupHistory(historyRes.data);
        setMyHistory(myHistoryRes.data);

        // --- Check user's role in this group ---
        if (groupData.admin._id === userInfo._id) {
          setIsAdmin(true);
        }
        const member = groupData.members.find(
          (m) => m.user._id === userInfo._id
        );
        if (member) {
          setIsMember(true);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching group details:', err);
        setError('Failed to load group details.');
        setLoading(false);
      }
    };
    fetchGroupDetails();
  }, [groupId]); // Dependency array is correct

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <div className={styles.pageContainer}>Loading dashboard...</div>;
  if (error) return <div className={styles.pageContainer}>Error: {error}</div>;
  if (!group) return <div className={styles.pageContainer}>Group not found.</div>;

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.header}>
        Group Dashboard
        {isAdmin && <span>(Admin)</span>}
      </h2>

      {/* --- Balance Box --- */}
      <div className={styles.balanceBox}>
        <div className={styles.balanceLabel}>Contribution Balance</div>
        <div className={styles.balanceAmount}>₦{groupBalance.toLocaleString()}</div>
        <div classNameclassName={styles.balanceLabel} style={{marginTop: '1rem'}}>Your Balance</div>
        <div className={styles.balanceAmount}>₦{userBalance.toLocaleString()}</div>
      </div>

      {/* --- Action Links --- */}
      <div className={styles.actionLinks}>
        {isAdmin && (
          <Link to={`/group/${groupId}/requests`} className={styles.adminLink}>
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

      {/* --- Group Details Box --- */}
      <div className={styles.groupDetailsCard}>
        <h3 className={styles.cardHeader}>{group.groupName}</h3>
        <div className={styles.cardBody}>
          <div className={styles.cardRow}>
            <span className={styles.cardLabel}>Payout</span>
            <span className={styles.cardValue}>₦{group.payoutAmount.toLocaleString()}</span>
          </div>
          <div className={styles.cardRow}>
            <span className={styles.cardLabel}>Contribution</span>
            <span className={styles.cardValue}>₦{group.contributionAmount.toLocaleString()}</span>
          </div>
          <div className={styles.cardRow}>
            <span className={styles.cardLabel}>Starts</span>
            <span className={styles.cardValue}>{formatDate(group.startingDate)}</span>
          </div>
          <div className={styles.cardRow}>
            <span className={styles.cardLabel}>Interval</span>
            <span className={styles.cardValue}>{group.payoutInterval} Days</span>
          </div>
          <div className={styles.cardRow}>
            <span className={styles.cardLabel}>Members</span>
            <span className={styles.cardValue}>{group.members.length} / {group.numberOfMembers}</span>
          </div>
          <div className={styles.cardRow}>
            <span className={styles.cardLabel}>Slots Left</span>
            <span className={styles.cardValue}>{group.availableNumbers.length}</span>
          </div>
        </div>
      </div>

      {/* --- Member List --- */}
      <div>
        <h3 className={styles.sectionHeader}>Members</h3>
        <ul className={styles.memberList}>
          {group.members.map((member, index) => (
            <li key={member._id || index} className={styles.memberListItem}>
              <div className={styles.memberInfo}>
                {index + 1}. {member.user.firstName} {member.user.lastName}
                <span>(Num: {member.chosenNumber})</span>
              </div>
              {member.user._id === group.admin._id && 
                <span className={styles.adminTag}>Admin</span>
              }
            </li>
          ))}
        </ul>
      </div>

      {/* --- History Tables --- */}
      <div className={styles.tableContainer}>
        <h3 className={styles.sectionHeader}>Contribution History (All)</h3>
        <table className={styles.historyTable}>
          <thead>
            <tr><th>Member Name</th><th>Amount</th><th>Date</th></tr>
          </thead>
          <tbody>
            {groupHistory.length === 0 ? (
              <tr><td colSpan="3" style={{textAlign: 'center'}}>No contributions yet.</td></tr>
            ) : (
              groupHistory.map((item) => (
                <tr key={item._id}>
                  <td>{item.user ? `${item.user.firstName} ${item.user.lastName}` : 'N/A'}</td>
                  <td>₦{item.amount.toLocaleString()}</td>
                  <td>{formatDate(item.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.tableContainer}>
        <h3 className={styles.sectionHeader}>My History</h3>
        <table className={styles.historyTable}>
          <thead>
            <tr><th>Amount</th><th>Date</th><th>Method</th></tr>
          </thead>
          <tbody>
            {myHistory.length === 0 ? (
              <tr><td colSpan="3" style={{textAlign: 'center'}}>You have no contributions.</td></tr>
            ) : (
              myHistory.map((item) => (
                <tr key={item._id}>
                  <td>₦{item.amount.toLocaleString()}</td>
                  <td>{formatDate(item.createdAt)}</td>
                  <td>{item.method}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- Join Button (if not a member) --- */}
      {!isMember && (
        <div className={styles.joinBox}>
          <p>You are not a member of this group.</p>
          <Link to={`/join/${groupId}`} className={styles.joinBtn}>
            Request to Join
          </Link>
        </div>
      )}

      {/* --- Logout Button --- */}
      <button onClick={handleLogout} className={styles.logoutBtn}>
        Log Out
      </button>
    </div>
  );
}

export default GroupDashboard;