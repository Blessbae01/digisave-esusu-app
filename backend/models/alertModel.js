// In backend/models/alertModel.js

const mongoose = require('mongoose');

const alertSchema = mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Group',
    },
    // Optional: Link to a specific user if the alert is about them
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['warning', 'critical', 'notice'],
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // 'createdAt' will be the log date
  }
);

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;