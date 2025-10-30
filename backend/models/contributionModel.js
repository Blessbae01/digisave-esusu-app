// In backend/models/contributionModel.js

const mongoose = require('mongoose');

const contributionSchema = mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Group',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      required: true,
      enum: ['transfer', 'card'],
    },
    reference: {
      type: String, // This will be the Paystack reference
    },
    status: {
      type: String,
      required: true,
      enum: ['successful', 'pending', 'failed'],
      default: 'successful',
    },
  },
  {
    timestamps: true, // 'createdAt' will be the payment date
  }
);

const Contribution = mongoose.model('Contribution', contributionSchema);

module.exports = Contribution;