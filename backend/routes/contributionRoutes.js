// In backend/routes/contributionRoutes.js

const express = require('express');
const router = express.Router();
const {
  logTransfer,
  verifyContribution,
  getGroupBalance,
  getMyBalance,
  getGroupContributionHistory, 
  getMyContributionHistory,    
} = require('../controllers/contributionController');
const { protect } = require('../middleware/authMiddleware');

// For logging a manual transfer
router.route('/transfer').post(protect, logTransfer);

// For verifying a card payment
router.route('/verify').post(protect, verifyContribution);

// For getting the dashboard balances
router.route('/group/:groupId/total').get(protect, getGroupBalance);
router.route('/group/:groupId/my-balance').get(protect, getMyBalance);
router
  .route('/group/:groupId/history')
  .get(protect, getGroupContributionHistory);

router
  .route('/group/:groupId/my-history')
  .get(protect, getMyContributionHistory);
  
module.exports = router;