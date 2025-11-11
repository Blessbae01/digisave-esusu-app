// In backend/controllers/groupController.js

const asyncHandler = require('express-async-handler');
const Group = require('../models/groupModel');
const User = require('../models/userModel'); 

/**
 * @desc    Create a new Esusu group
 * @route   POST /api/groups
 * @access  Private (Protected)
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
    adminChosenNumber, 
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
 * @desc    Get all available Esusu groups (for the "Explore" page)
 * @route   GET /api/groups
 * @access  Public
 */
const getGroups = asyncHandler(async (req, res) => {
  // Find all groups and sort them by newest first
  const groups = await Group.find({}).sort({ createdAt: -1 });
  res.status(200).json(groups);
});

/**
 * @desc    Get a single group by its ID
 * @route   GET /api/groups/:id
 * @access  Private (must be logged in AND a member to see group details)
 */
const getGroupById = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
    // CRITICAL: Ensure robust and consistent population
    .populate('admin', 'firstName lastName email') 
    .populate('members.user', 'firstName lastName'); // <-- Simplified fields
    // .populate('members.user', 'firstName lastName email'); // Original line was safer, but let's test this simplified version

  if (!group) { 
    res.status(404);
    throw new Error('Group not found');
  }
    
    // Authorization logging is now removed, assuming it passed.

  // --- CRITICAL AUTHORIZATION CHECK (Confirmed working) ---
  const isMember = group.members.some(member => {
        if (!member.user || !member.user._id) return false;
        return member.user._id.toString() === req.user._id.toString();
    });

  if (!isMember) {
    res.status(403); 
    throw new Error('Insufficient permissions. User is not a member of this group.');
  }
  // ---------------------------------------------------------

  // If the check passes, send the data
  res.status(200).json(group);
});

const getMyGroups = asyncHandler(async (req, res) => {
    // This line gets the ID from the JWT token passed via the 'protect' middleware.
    const userId = req.user._id; 

    // This query finds all groups where the user's ID exists in the 'members.user' array.
    const myGroups = await Group.find({
        'members.user': userId, // Correct Mongoose query for embedded user IDs
    }).sort({ createdAt: -1 }); // Sort by newest joined

    res.status(200).json(myGroups);
});

// Export the functions
module.exports = {
  createGroup,
  getGroups,
  getGroupById,
  getMyGroups,
};