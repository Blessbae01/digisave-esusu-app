// In backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');

// When a POST request comes to /register, use the registerUser function
router.post('/register', registerUser);

// When a POST request comes to /login, use the loginUser function
router.post('/login', loginUser);

module.exports = router;