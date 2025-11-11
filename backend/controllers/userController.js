// In backend/controllers/userController.js

const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Function to generate a JWT token
const generateToken = (id) => {
  // process.env.JWT_SECRET is a secret key we need to add to our .env file
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token will be valid for 30 days
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
    // --- DEBUGGING LOG ---
    console.log("Received signup data:", req.body);
    // ---------------------

  // 1. Get data from the request body
  const { firstName, lastName, phoneNumber, bvn, email, password } = req.body;

  // 2. Check if all fields exist
  if (!firstName || !lastName || !phoneNumber || !bvn || !email || !password) {
    res.status(400);
    throw new Error('Please fill in all fields');
  }

  // 3. Check if user already exists in the database
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  // 4. Check if BVN already exists
  const bvnExists = await User.findOne({ bvn });
  if (bvnExists) {
    res.status(400);
    throw new Error('This BVN is already registered to another account');
  }

// --- IMPORTANT ---
  // TODO: Add BVN verification logic here.
  // This is where we will call an API (like Paystack)
  // to confirm the BVN is real and matches the user's name.
  // For now, we are just collecting it.
  // -----------------


  // 4. Create a new user (password will be auto-hashed by our model)
  const user = await User.create({
    firstName,
    lastName,
    phoneNumber,
    bvn,
    email,
    password,
  });

  // 5. If user was created successfully, send back user data and a token
  if (user) {
    res.status(201).json({
      _id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @desc    Authenticate (login) a user
 * @route   POST /api/users/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Find the user by email
  const user = await User.findOne({ email });

  // 2. Check if user exists AND if passwords match
  if (user && (await user.matchPassword(password))) {
    // 3. Send back user data and token
    res.json({
      _id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401); // 401 means 'Unauthorized'
    throw new Error('Invalid email or password');
  }
});

module.exports = {
  registerUser,
  loginUser,
};