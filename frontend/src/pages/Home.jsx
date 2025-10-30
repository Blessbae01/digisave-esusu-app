// In frontend/src/pages/Home.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { IoAddCircleOutline } from 'react-icons/io5'; // Import the icon
import styles from './Home.module.css'; // Import our new CSS module

function Home() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/groups');
        setGroups(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching groups:', err);
        setError('Failed to load groups.');
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className={styles.pageContainer}>Loading groups...</div>;
  }

  if (error) {
    return <div className={styles.pageContainer}>{error}</div>;
  }

  return (
    <div className={styles.pageContainer}>
      {/* --- Header with Create Button --- */}
      <header className={styles.header}>
        <Link to="/create-group">
          <button className={styles.createGroupBtn}>
            <IoAddCircleOutline />
            Create Your Group
          </button>
        </Link>
      </header>

      {/* --- Explore Groups Section --- */}
      <h2 className={styles.exploreHeader}>Explore Available Groups</h2>
      
      <div className={styles.groupList}>
        {groups.length === 0 ? (
          <p>No groups available right now. Why not create one?</p>
        ) : (
          groups.map((group) => (
            <Link to={`/group/${group._id}`} key={group._id} className={styles.groupCardLink}>
              <div className={styles.groupCard}>
                
                <div className={styles.cardHeader}>
                  <span className={styles.groupName}>{group.groupName}</span>
                  <span className={styles.statusTag}>Active</span>
                </div>
                
                <div className={styles.cardBody}>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Payout</span>
                    <span className={styles.cardValueAmount}>
                      ₦{group.payoutAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Contribution</span>
                    <span className={styles.cardValue}>
                      ₦{group.contributionAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Starts</span>
                    <span className={styles.cardValue}>
                      {formatDate(group.startingDate)}
                    </span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Interval</span>
                    <span className={styles.cardValue}>
                      {group.payoutInterval} Days
                    </span>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.membersInfo}>
                    {group.members.length} / {group.numberOfMembers} Members
                  </span>
                  <span className={styles.numbersAvailable}>
                    {group.availableNumbers.length} slots left
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;