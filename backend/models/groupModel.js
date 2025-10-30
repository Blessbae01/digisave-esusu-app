// In backend/models/groupModel.js

const mongoose = require('mongoose');

const groupSchema = mongoose.Schema(
  {
    // 1. User who created the group (the Admin)
    // We link this to the 'User' model
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // This creates the relationship
    },
    // 2. Details from your "Create Group" form
    groupName: {
      type: String,
      required: [true, 'Please add a group name'],
    },
    payoutAmount: {
      type: Number,
      required: [true, 'Please add a payout amount'],
    },
    startingDate: {
      type: Date,
      required: [true, 'Please add a starting date'],
    },
    contributionAmount: {
      type: Number,
      required: [true, 'Please add a contribution amount'],
    },
    numberOfMembers: {
      type: Number,
      required: [true, 'Please add the number of members'],
    },
    // Admin's phone number (can be different from their user profile)
    phoneNumber: {
      type: String,
      required: [true, 'Please add a contact phone number'],
    },
    // Admin's bank details for contributions
    corporateAccount: {
      type: String,
      required: [true, 'Please add the account number'],
    },
    bankName: {
      type: String,
      required: [true, 'Please add the bank name'],
    },
    accountName: {
      type: String,
      required: [true, 'Please add the account name'],
    },
    payoutInterval: {
      type: Number, // Storing this in days, as you specified
      required: [true, 'Please add a payout interval (in days)'],
    },
    payoutTime: {
      type: String, // Storing as string, e.g., "3:00pm"
      required: [true, 'Please add a payout time'],
    },

    // 3. Group Status and Member Management
    status: {
      type: String,
      enum: ['Pending', 'Active', 'Completed'],
      default: 'Pending',
    },
   // A list of all members in the group
        members: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
              required: true,
            },
            chosenNumber: {
              type: Number,
              required: true,
            },
            // We'll add these fields later when members join
            // but the admin can have them too
            bankName: { type: String },
            accountName: { type: String },
            accountNumber: { type: String },
          },
        ],
        // A list of available slots/numbers to pick
        availableNumbers: {
          type: [Number], // An array of numbers
        },
      },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;