// In backend/routes/groupRoutes.js

const express = require('express');
const router = express.Router();
const { createGroup, getGroups, getGroupById, getMyGroups} = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

// Define the routes for '/api/groups'

// GET /api/groups   -> Get all groups (Public)
// POST /api/groups  -> Create a group (Protected)
router.route('/')
  .get(getGroups)
  .post(protect, createGroup); // We use our 'protect' middleware here
router.route('/:id').get(protect, getGroupById);
router.route('/mygroups').get(protect, getMyGroups);

module.exports = router;