// In backend/controllers/groupController.js

const asyncHandler = require('express-async-handler');
const Group = require('../models/groupModel');
const User = require('../models/userModel'); // We might need this later

/**
 * @desc    Create a new Esusu group
 * @route   POST /api/groups
 * @access  Private (Protected)
 */
const createGroup = asyncHandler(async (req, res) => {
  // 1. Get all the data from the form
  const {
    groupName,
    payoutAmount,
    startingDate,
    contributionAmount,
    numberOfMembers,
    phoneNumber,
    corporateAccount,
    bankName,
    accountName,
    payoutInterval,
    payoutTime,
    adminChosenNumber, // <-- OUR NEW FIELD
  } = req.body;

  // 2. Validation
  if (
    !groupName || !payoutAmount || !startingDate || !contributionAmount ||
    !numberOfMembers || !phoneNumber || !corporateAccount || !bankName ||
    !accountName || !payoutInterval || !payoutTime || !adminChosenNumber
  ) {
    res.status(400);
    throw new Error('Please fill in all fields, including your chosen number');
  }

  // Convert types
  const numMembers = Number(numberOfMembers);
  const chosenNum = Number(adminChosenNumber);

  if (chosenNum < 1 || chosenNum > numMembers) {
    res.status(400);
    throw new Error('Your chosen number is not within the group size range');
  }

  // 3. Prepare the group data (NEW LOGIC)

  // Create an array of all possible numbers (e.g., [1, 2, 3, 4, 5])
  const allNumbers = Array.from({ length: numMembers }, (_, i) => i + 1);

  // Create the availableNumbers array by removing the admin's chosen number
  const availableNumbers = allNumbers.filter((num) => num !== chosenNum);

  // Create the admin's member object
  const adminAsMember = {
    user: req.user._id, // from 'protect' middleware
    chosenNumber: chosenNum,
    // Admin's bank details (for receiving payout)
    // We can pre-fill this from their user profile or create group form
    // For now, let's leave it blank, they can update it later.
  };

  // 4. Create the new group in the database
  const group = await Group.create({
    admin: req.user._id,
    groupName,
    payoutAmount,
    startingDate,
    contributionAmount,
    numberOfMembers: numMembers,
    phoneNumber,
    corporateAccount,
    bankName,
    accountName,
    payoutInterval,
    payoutTime,
    availableNumbers: availableNumbers, // The list *without* the admin's number
    members: [adminAsMember], // Add the admin as the first member
  });

  // 5. Send back the new group data
  res.status(201).json(group);
});

/**
 * @desc    Get all available Esusu groups (for the "Explore" page)
 * @route   GET /api/groups
 * @access  Public
 */
const getGroups = asyncHandler(async (req, res) => {
  // Find all groups and sort them by newest first
  const groups = await Group.find({}).sort({ createdAt: -1 });
  res.status(200).json(groups);
});

/**
 * @desc    Get a single group by its ID
 * @route   GET /api/groups/:id
 * @access  Private (must be logged in to see group details)
 */
const getGroupById = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate('admin', 'firstName lastName email') // Get admin's name/email
    .populate('members.user', 'firstName lastName email'); // Get member's name/email

  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  // We'll add a check later to see if the user is a member
  res.status(200).json(group);
});


// Export the functions
module.exports = {
  createGroup,
  getGroups,
  getGroupById,
};