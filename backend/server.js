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
// --- 🛠️ CORS FIXES: ALLOW VERCEL FRONTEND TO ACCESS RENDER BACKEND 🛠️ ---
// ----------------------------------------------------------------------

// ⚠️ REPLACE 'YOUR_VERCEL_URL' with your actual Vercel domain! ⚠️
const allowedOrigins = [
    // 1. Local Development URL
    'http://localhost:5173', 
    // 2. Deployed Frontend URL (CRITICAL FIX)
    process.env.FRONTEND_URL || 'https://digisave-esusu-app.vercel.app',
    // 3. Your Render Backend URL (often needed for testing/internal calls)
    'https://digisave-esusu-backend.onrender.com'
];

// 1. Configure the Main CORS Middleware for Express Routes (GET, POST, etc.)
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        // AND allow origins that are in the allowedOrigins array.
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS: ' + origin));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Explicitly allow all required methods
    credentials: true // Crucial for sending cookies/tokens with authorization headers
}));

// 2. Handle preflight requests (OPTIONS method) which are required for complex requests (like those with Authorization headers)
app.options('*', cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS: ' + origin));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], 
    credentials: true 
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
// 3. Fix Socket.IO CORS Configuration to allow Vercel Frontend
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