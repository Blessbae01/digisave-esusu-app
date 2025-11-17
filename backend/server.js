// In backend/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
// --- SOCKET.IO IMPORTS ---
const http = require('http'); // New import
const { Server } = require('socket.io'); // New import
// -------------------------

const connectDB = require('./config/db.js'); // <-- Import
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const requestRoutes = require('./routes/requestRoutes');
const contributionRoutes = require('./routes/contributionRoutes');
const alertRoutes = require('./routes/alertRoutes');

const { startScheduler } = require('./scheduler/alertScheduler'); 
const { startPayoutScheduler } = require('./scheduler/payoutScheduler');

// <-- NEW IMPORT -->
const { startActivateGroupsScheduler } = require('./scheduler/activateGroupsScheduler');

// Load environment variables
dotenv.config();

connectDB(); // <-- Call the connect function

const app = express();

// --- CREATE HTTP SERVER ---
const server = http.createServer(app); // Use http module to create the server
// --------------------------

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Allow app to accept JSON

// A simple test route // --- API Routes ---
app.get('/', (req, res) => {
  res.send('Esusu App Backend is running!');
});

// 2. Mount the routes
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/alerts', alertRoutes);

// --- SOCKET.IO SERVER SETUP ---
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Allow your frontend to connect
        methods: ["GET", "POST"]
    }
});

// Store connected users (map userId to socketId)
const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
    // When a user logs in on the frontend, they send their ID here
    socket.on('userConnected', (userId) => {
        onlineUsers.set(userId, socket.id);
        console.log(`User ${userId} is now online.`);
    });
    
    socket.on('disconnect', () => {
        // Remove user from the map on disconnect
        for (let [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                console.log(`User ${userId} disconnected.`);
                break;
            }
        }
    });
});
// ------------------------------

const PORT = process.env.PORT || 5000;

// --- INITIALIZATIONS ---
// 1. Start the alert check for overdue payments
startScheduler(); 

// 2. Start the automatic payout process
startPayoutScheduler(); 

// 3. Start the pending groups activation scheduler <-- NEW
startActivateGroupsScheduler();

// IMPORTANT: Change app.listen to server.listen
server.listen(PORT, () => { // <--- USE 'server.listen' HERE
  console.log(`Server is running on http://localhost:${PORT}`);
});