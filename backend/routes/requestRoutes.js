// In backend/routes/requestRoutes.js

const express = require('express');
const router = express.Router();
const { submitJoinRequest, getPendingRequests, // <-- Import
  approveRequest,
  rejectRequest,} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/requests
// We protect this route. Only logged-in users can submit a request.
router.route('/').post(protect, submitJoinRequest);

// GET /api/requests/group/:groupId (Get pending requests for a group)
router.route('/group/:groupId').get(protect, getPendingRequests);

// PUT /api/requests/:id/approve (Approve a request)
router.route('/:id/approve').put(protect, approveRequest);

// PUT /api/requests/:id/reject (Reject a request)
router.route('/:id/reject').put(protect, rejectRequest);

module.exports = router;