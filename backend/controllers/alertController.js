// In backend/controllers/alertController.js

const asyncHandler = require('express-async-handler');
const Alert = require('../models/alertModel');

/**
 * @desc    Get all alerts for a specific group
 * @route   GET /api/alerts/group/:groupId
 * @access  Private (must be a group member)
 */
const getAlertsForGroup = asyncHandler(async (req, res) => {
  // TODO: We should add a check here to ensure
  // the logged-in user is a member of this group.

  const alerts = await Alert.find({
    group: req.params.groupId,
  }).sort({ createdAt: -1 }); // Show newest first

  res.status(200).json(alerts);
});

module.exports = {
  getAlertsForGroup,
};