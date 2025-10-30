// In backend/routes/alertRoutes.js

const express = require('express');
const router = express.Router();
const { getAlertsForGroup } = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/alerts/group/:groupId
router.route('/group/:groupId').get(protect, getAlertsForGroup);

module.exports = router;