import React, { useState } from 'react';
import styles from '../pages/Auth.module.css'; // Use the shared Auth styling

const Policy = ({ agreed, setAgreed }) => {
    // State to toggle visibility of the full policy text (optional)
    const [showPolicy, setShowPolicy] = useState(false);

    return (
        <div className={styles.policyContainer}>
            <div className={styles.policyCheckboxGroup}>
                <input
                    type="checkbox"
                    id="policy-agree"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    style={{ marginRight: '10px' }}
                />
                <label htmlFor="policy-agree" style={{ fontSize: '0.9rem' }}>
                    I have read and agree to the 
                    <span 
                        onClick={() => setShowPolicy(!showPolicy)} 
                        style={{ color: '#008f39', cursor: 'pointer', marginLeft: '5px', textDecoration: 'underline' }}
                    >
                        Terms and Privacy Policy
                    </span>.
                </label>
            </div>
            
            {/* Full Policy Text (Visible when clicked) */}
            {showPolicy && (
                <div className={styles.policyText}>
                    <h4>Privacy and Risk Policy for DigiSave</h4>
                    <p>
                        By checking this box, you confirm that you understand and agree to the terms of service of the DigiSave platform. [cite_start]We commit to protecting your personal data (including BVN) using industry-standard encryption. [cite: 1] [cite_start]We are not a bank; contributions are managed within private rotating savings groups (ROSCA). [cite: 2] [cite_start]While we provide automation and compliance checks, we are not liable for member default or disputes. [cite: 3] [cite_start]You must review your local agricultural extension office guidelines. [cite: 4]
                    </p>
                    <p>
                        [cite_start]Your contribution amount will be automatically deducted based on the Payout Interval defined by your group's admin. [cite: 5] [cite_start]You acknowledge that you must be logged in to access secured features like the Group Dashboard. [cite: 6]
                    </p>
                    <button onClick={() => setShowPolicy(false)} className={styles.policyCloseBtn}>Close</button>
                </div>
            )}
        </div>
    );
};

export default Policy;