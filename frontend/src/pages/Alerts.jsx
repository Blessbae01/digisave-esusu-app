// In frontend/src/pages/Alerts.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './Alerts.module.css'; // Import our new CSS module
import { 
  IoArrowBack, 
  IoWarning, 
  IoShieldCheckmark, 
  IoMegaphone 
} from 'react-icons/io5'; // Import icons

function Alerts() {
  const { groupId } = useParams();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchAlerts = async () => {
      if (!userInfo) {
        setError('You must be logged in.');
        setLoading(false);
        return;
      }
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const { data } = await axios.get(
          `http://localhost:5000/api/alerts/group/${groupId}`,
          config
        );
        setAlerts(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setError('Failed to load alerts.');
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [groupId, userInfo.token]);

  // Helper function to get the correct style and icon
  const getAlertProps = (type) => {
    switch (type) {
      case 'warning':
        return { style: styles.warning, icon: <IoWarning /> };
      case 'critical':
        return { style: styles.critical, icon: <IoShieldCheckmark /> };
      case 'notice':
        return { style: styles.notice, icon: <IoMegaphone /> };
      default:
        return { style: styles.alertItem, icon: null };
    }
  };

  // Helper function to format the log date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) return <div className={styles.pageContainer}>Loading alerts...</div>;
  if (error) return <div className={styles.pageContainer}>Error: {error}</div>;

  return (
    <div className={styles.pageContainer}>
      <Link to={`/group/${groupId}`} className={styles.backButton}>
        <IoArrowBack /> Back to Dashboard
      </Link>
      
      <h2 className={styles.header}>Alerts</h2>

      {alerts.length === 0 ? (
        <p className={styles.noAlerts}>No new alerts.</p>
      ) : (
        <div>
          {alerts.map((alert) => {
            const { style, icon } = getAlertProps(alert.type);
            return (
              <div key={alert._id} className={style}>
                <h4 className={styles.alertHeader}>
                  {icon}
                  {alert.type.toUpperCase()}
                </h4>
                <p className={styles.alertMessage}>{alert.message}</p>
                <em className={styles.alertTimestamp}>
                  Logged: {formatDate(alert.createdAt)}
                </em>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Alerts;