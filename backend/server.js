// In backend/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
// --- SOCKET.IO IMPORTS ---
const http = require('http'); 
const { Server } = require('socket.io'); 
// -------------------------

const connectDB = require('./config/db.js'); 
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const requestRoutes = require('./routes/requestRoutes');
const contributionRoutes = require('./routes/contributionRoutes');
const alertRoutes = require('./routes/alertRoutes');

const { startScheduler } = require('./scheduler/alertScheduler'); 
const { startPayoutScheduler } = require('./scheduler/payoutScheduler');
const { startActivateGroupsScheduler } = require('./scheduler/activateGroupsScheduler');

// Load environment variables
dotenv.config();

connectDB(); 

const app = express();

// --- CREATE HTTP SERVER ---
const server = http.createServer(app); 
// --------------------------

// ----------------------------------------------------------------------
// --- 🛠️ CORRECTED CORS CONFIGURATION (Fixes PathError Crash) 🛠️ ---
// ----------------------------------------------------------------------

// Define the allowed origins as an Array
const allowedOrigins = [
    // 1. Local Development URL (default Vite port)
    'http://localhost:5173', 
    // 2. Deployed Vercel Frontend URL (CRITICAL FIX)
    'https://digisave-esusu-app.vercel.app', 
    // 3. Your Render Backend URL 
    'https://digisave-esusu-backend.onrender.com'
];

// 1. Configure the Main CORS Middleware for Express Routes
// This single block handles all requests, including preflight OPTIONS requests,
// which prevents the 'PathError' crash you encountered.
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        // AND allow origins that are in the allowedOrigins array.
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error('CORS blocked request from origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Explicitly allow all methods
    credentials: true // Crucial for sending tokens/auth headers
}));
// ----------------------------------------------------------------------

// Middleware
app.use(express.json()); // Allow app to accept JSON

// A simple test route 
app.get('/', (req, res) => {
    res.send('Esusu App Backend is running!');
});

// 2. Mount the API routes
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/alerts', alertRoutes);

// --- SOCKET.IO SERVER SETUP ---
// 3. Socket.IO CORS Configuration
const io = new Server(server, {
    cors: {
        origin: allowedOrigins, // Use the configured allowedOrigins array
        methods: ["GET", "POST"]
    }
});

// Store connected users (map userId to socketId)
const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
    socket.on('userConnected', (userId) => {
        onlineUsers.set(userId, socket.id);
        console.log(`User ${userId} is now online.`);
    });
    
    socket.on('disconnect', () => {
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
// Start the alert check for overdue payments
startScheduler(); 

// Start the automatic payout process
startPayoutScheduler(); 

// Start the pending groups activation scheduler 
startActivateGroupsScheduler();

// IMPORTANT: Use server.listen here!
server.listen(PORT, () => { 
    console.log(`Server is running on http://localhost:${PORT}`);
});