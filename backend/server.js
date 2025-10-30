// In backend/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db.js'); // <-- Import
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const requestRoutes = require('./routes/requestRoutes');
const contributionRoutes = require('./routes/contributionRoutes');
const alertRoutes = require('./routes/alertRoutes');

// Load environment variables
dotenv.config();

connectDB(); // <-- Call the connect function

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Allow app to accept JSON

// A simple test route // --- API Routes ---
app.get('/', (req, res) => {
  res.send('Esusu App Backend is running!');
});

// 2. Mount the routes
// This tells the server:
// Any request to '/api/users' should be handled by 'userRoutes'
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/alerts', alertRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});