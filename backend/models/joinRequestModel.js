// In backend/models/joinRequestModel.js

const mongoose = require('mongoose');

const joinRequestSchema = mongoose.Schema(
  {
    // Link to the group the user wants to join
    group: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Group',
    },
    // Link to the user who is sending the request
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    // Status of the request (for the admin)
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    // --- Data from the join form ---
    fullName: {
      type: String,
      required: [true, 'Please provide your full name'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please provide your phone number'],
    },
    // For now, we'll treat this as a URL to a hosted image
    passportPhotograph: {
      type: String, 
    },
    chosenNumber: {
      type: Number,
      required: [true, 'Please choose a payout number'],
    },
    accountNumber: {
      type: String,
      required: [true, 'Please provide your account number'],
    },
    bankName: {
      type: String,
      required: [true, 'Please provide your bank name'],
    },
    accountName: {
      type: String,
      required: [true, 'Please provide your account name'],
    },
  },
  {
    timestamps: true,
  }
);

const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema);

module.exports = JoinRequest;