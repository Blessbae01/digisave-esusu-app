// In frontend/src/pages/Contribute.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Contribute.module.css'; // Import our styles
import { IoArrowBack } from 'react-icons/io5'; // Import back icon

function Contribute() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState(0);

  const userInfo = JSON.parse(localStorage.getItem('user'));
  const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  // 1. Fetch group details
  useEffect(() => {
    if (!userInfo) {
      setError('You must be logged in to view this page.');
      setLoading(false);
      return;
    }
    const fetchGroupDetails = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(
          `http://localhost:5000/api/groups/${groupId}`,
          config
        );
        setGroup(data);
        setAmount(data.contributionAmount);
        setLoading(false);
      } catch (err) {
        setError('Failed to load group details.');
        setLoading(false);
      }
    };
    fetchGroupDetails();
  }, [groupId, userInfo]);

  // 2. Backend verification function (this is correct)
  const verifyPayment = async (reference) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const verificationData = { reference, groupId, amount };
      
      await axios.post(
        'http://localhost:5000/api/contributions/verify',
        verificationData,
        config
      );
      
      alert('Payment verified and logged successfully!');
      navigate(`/group/${groupId}`);
    } catch (err) {
      let errorMessage = err.response ? err.response.data.message : err.message;
      alert(`Payment verification FAILED.\n\nERROR: ${errorMessage}`);
    }
  };

  // 3. Manual transfer function (this is correct)
  const handleTransfer = async () => {
    if (window.confirm('Are you sure you have completed the bank transfer?')) {
      try {
        const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
        const transferData = { groupId, amount, method: 'transfer' };
        await axios.post(
          'http://localhost:5000/api/contributions/transfer',
          transferData,
          config
        );
        alert('Transfer logged successfully!');
        navigate(`/group/${groupId}`);
      } catch (err) {
        let errorMessage = err.response ? err.response.data.message : err.message;
        alert(`Failed to log transfer.\n\nERROR: ${errorMessage}`);
      }
    }
  };

  // 4. --- THIS IS THE NEW, STABLE PAYSTACK FUNCTION ---
  const payWithPaystack = () => {
    // This checks if the Paystack script has loaded
    if (!window.PaystackPop) {
      alert('Paystack script has not loaded. Please refresh the page.');
      return;
    }

    var handler = window.PaystackPop.setup({
      key: paystackPublicKey, // Your public key
      email: userInfo.email,
      amount: amount * 100, // Amount in kobo
      ref: new Date().getTime().toString(), // Unique reference
      onClose: function(){
        console.log('Payment popup closed.');
      },
      callback: function(response){
        // This 'callback' is the same as 'onSuccess'
        // It's called when Paystack confirms the payment
        console.log('Paystack success:', response);
        verifyPayment(response.reference); // Call our backend verification
      }
    });
    handler.openIframe(); // This opens the popup
  };
  // --- END OF NEW FUNCTION ---

  // --- Render the page ---
  if (loading) return <div className={styles.pageContainer}>Loading...</div>;
  if (error) return <div className={styles.pageContainer}>Error: {error}</div>;
  if (!group || !userInfo) {
    return (
      <div className={styles.pageContainer}>
        <p>Error: Could not load group details or you are not logged in.</p>
        <Link to="/login">Please log in</Link>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Link to={`/group/${groupId}`} className={styles.backButton}>
        <IoArrowBack /> Back to Dashboard
      </Link>
      
      <h2 className={styles.header}>Contribute</h2>

      <form className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Payer Name</label>
          <input 
            type="text" 
            value={`${userInfo.firstName} ${userInfo.lastName}`} 
            readOnly 
            className={styles.formInput}
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Amount</label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className={styles.formInput}
          />
        </div>
      </form>

      <div className={styles.paymentOption}>
        <h4>Pay via Transfer</h4>
        <div className={styles.transferDetails}>
          <p><strong>Admin Account:</strong> {group.corporateAccount}</p>
          <p><strong>Bank Name:</strong> {group.bankName}</p>
          <p><strong>Account Name:</strong> {group.accountName}</p>
        </div>
        <button onClick={handleTransfer} className={styles.transferBtn}>
          I have Paid (Transfer)
        </button>
      </div>

      <div className={styles.paymentOption}>
        <h4>Pay with Card (Paystack)</h4>
        
        <button 
          onClick={payWithPaystack}
          className={styles.btn}
          disabled={amount === 0}
        >
          {`Pay with Card (₦${amount})`}
        </button>
      </div>
    </div>
  );
}

export default Contribute;