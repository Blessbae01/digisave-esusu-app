// In backend/controllers/requestController.js

const asyncHandler = require('express-async-handler');
const JoinRequest = require('../models/joinRequestModel');
const Group = require('../models/groupModel');

/**
 * @desc    Submit a new join request
 * @route   POST /api/requests
 * @access  Private
 */
const submitJoinRequest = asyncHandler(async (req, res) => {
  const {
    groupId,
    fullName,
    phoneNumber,
    passportPhotograph,
    chosenNumber,
    accountNumber,
    bankName,
    accountName,
  } = req.body;

  const userId = req.user._id; // From our 'protect' middleware

  // 1. Find the group they want to join
  const group = await Group.findById(groupId);
  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  // 2. Check if the chosen number is actually available
  if (!group.availableNumbers.includes(Number(chosenNumber))) {
    res.status(400);
    throw new Error('That number is not available in this group');
  }

  // 3. Check if user already has a pending request for this group
  const existingRequest = await JoinRequest.findOne({
    group: groupId,
    user: userId,
    status: 'pending',
  });
  if (existingRequest) {
    res.status(400);
    throw new Error('You already have a pending request for this group');
  }

  // 4. Create and save the new join request
  const request = await JoinRequest.create({
    group: groupId,
    user: userId,
    fullName,
    phoneNumber,
    passportPhotograph, // This will be a URL string for now
    chosenNumber: Number(chosenNumber),
    accountNumber,
    bankName,
    accountName,
    status: 'pending', // Explicitly set as pending
  });

  res.status(201).json(request);
});

/**
 * @desc    Get all pending requests for a specific group (for admin)
 * @route   GET /api/requests/group/:groupId
 * @access  Private (Admin only)
 */
const getPendingRequests = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  // 1. Find the group
  const group = await Group.findById(groupId);
  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  // 2. Check if logged-in user is the admin
  if (group.admin.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  // 3. Find all pending requests for this group
  const requests = await JoinRequest.find({
    group: groupId,
    status: 'pending',
  }).populate('user', 'firstName lastName email'); // Show who sent it

  res.status(200).json(requests);
});

/**
 * @desc    Approve a join request (Admin only)
 * @route   PUT /api/requests/:id/approve
 * @access  Private (Admin only)
 */
const approveRequest = asyncHandler(async (req, res) => {
  const { id } = req.params; // This is the ID of the JoinRequest

  // 1. Find the request
  const request = await JoinRequest.findById(id);
  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  // 2. Find the group
  const group = await Group.findById(request.group);
  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  // 3. Check if logged-in user is the admin of *this* group
  if (group.admin.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  // 4. --- This is the main logic ---
  // 4a. Add the new member to the group's 'members' array
  const newMember = {
    user: request.user,
    chosenNumber: request.chosenNumber,
    bankName: request.bankName,
    accountName: request.accountName,
    accountNumber: request.accountNumber,
  };
  group.members.push(newMember);

  // 4b. Remove the chosen number from 'availableNumbers'
  group.availableNumbers = group.availableNumbers.filter(
    (num) => num !== request.chosenNumber
  );

  // 4c. Update the request status
  request.status = 'approved';

  // 5. Save the changes to the database
  await group.save();
  await request.save();

  res.status(200).json({ message: 'Member approved and added to group' });
});

/**
 * @desc    Reject a join request (Admin only)
 * @route   PUT /api/requests/:id/reject
 * @access  Private (Admin only)
 */
const rejectRequest = asyncHandler(async (req, res) => {
  const { id } = req.params; // This is the ID of the JoinRequest

  // 1. Find the request
  const request = await JoinRequest.findById(id);
  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  // 2. Find the group (to check admin status)
  const group = await Group.findById(request.group);
  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  // 3. Check if logged-in user is the admin
  if (group.admin.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  // 4. Update status to 'rejected'
  request.status = 'rejected';
  await request.save();

  res.status(200).json({ message: 'Request rejected' });
});

module.exports = {
  submitJoinRequest,
  getPendingRequests,
  approveRequest,
  rejectRequest,
};