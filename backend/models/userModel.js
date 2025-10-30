// In backend/models/userModel.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    // Based on your Signup Page fields
    firstName: {
      type: String,
      required: [true, 'Please add a first name'],
    },
    lastName: {
      type: String,
      required: [true, 'Please add a last name'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please add a phone number'],
    },

    bvn: {
      type: String,
      required: [true, 'Please add your BVN'],
      unique: true, // No two users can share a BVN
      length: [11, 'BVN must be 11 digits'],
    },

    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true, // No two users can have the same email
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6, // Enforce a minimum password length
    },
  },
  {
    // This adds 'createdAt' and 'updatedAt' fields automatically
    timestamps: true,
  }
);

// This is middleware that runs *before* a new user is saved
userSchema.pre('save', async function (next) {
  // 'this' refers to the user document being saved
  if (!this.isModified('password')) {
    // If the password hasn't been changed, skip hashing
    return next();
  }

  // 1. Generate a 'salt' - random characters for hashing
  const salt = await bcrypt.genSalt(10);
  // 2. Hash the password using the salt
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;