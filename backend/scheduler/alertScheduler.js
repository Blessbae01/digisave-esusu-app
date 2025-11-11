// In backend/scheduler/alertScheduler.js

const cron = require('node-cron');
const moment = require('moment'); // Required for robust date calculations

const Group = require('../models/groupModel');
const Contribution = require('../models/contributionModel');
const Alert = require('../models/alertModel');

// ⚠️ NOTE: You MUST import 'io' and 'onlineUsers' from your server/socket setup file here.
// Example: const { io, onlineUsers } = require('../socketSetup'); 
// Assuming they are available in scope for this code update:
const io = null; // Placeholder for io
const onlineUsers = new Map(); // Placeholder for onlineUsers

// --- Helper Functions ---

/**
 * Calculates the expected contribution deadline for a given cycle.
 * In an Esusu, payment is generally due to fund the NEXT payout.
 * For simplicity, we define the deadline as the start of the current payout cycle.
 * @param {Object} group - The Mongoose Group document.
 * @param {number} cycleNumber - The 1-based index of the current contribution cycle.
 * @returns {moment} The calculated deadline date.
 */
const getContributionDeadline = (group, cycleNumber) => {
    const startingDate = moment(group.startingDate);
    const payoutInterval = group.payoutInterval; // in days

    // Calculation: (Cycle Number - 1) * Payout Interval
    // Cycle 1 (Admin's cycle): (1 - 1) * 30 = 0 days. Deadline is Starting Date.
    // Cycle 2: (2 - 1) * 30 = 30 days. Deadline is Starting Date + 30 days.
    const daysToAdd = (cycleNumber - 1) * payoutInterval;
    
    // We set the deadline to the end of that day to give maximum time
    return startingDate.clone().add(daysToAdd, 'days').endOf('day');
};

/**
 * Gets the expected contribution cycle number currently due.
 * This is based on the number of successful payouts executed.
 * @param {Object} group - The Mongoose Group document.
 * @returns {Promise<number>} The 1-based index of the cycle currently being funded.
 */
const getCurrentFundingCycle = async (group) => {
    // A contribution is due to fund the payout for the *next* member in line.
    const payouts = await Contribution.find({ 
        group: group._id, 
        method: 'payout', 
        status: 'successful' 
    });
    // If 3 payouts have happened, we are currently funding payout #4 (Cycle 4).
    return payouts.length + 1; 
};


// --- Main Scheduler Logic ---

const checkOverduePayments = async () => {
    console.log('Running scheduled check for overdue contributions...');
    const now = moment();

    // Find all groups that are currently running (Active or still Pending members)
    const runningGroups = await Group.find({
        status: { $in: ['Pending', 'Active'] },
        startingDate: { $lte: now.toDate() } // Only groups that have started
    }).populate('members.user'); // Populate user data to identify members

    for (const group of runningGroups) {
        
        const currentCycleNumber = await getCurrentFundingCycle(group);

        if (currentCycleNumber > group.numberOfMembers) {
            // All members have been paid. Payout Scheduler handles status update, but good to check.
            continue; 
        }
        
        // 1. Calculate the deadline for the contribution that funds the current cycle
        const deadline = getContributionDeadline(group, currentCycleNumber);
        
        // Check if the deadline has passed
        if (now.isBefore(deadline)) {
            continue; // Deadline hasn't passed yet, skip group
        }

        const daysOverdue = now.diff(deadline, 'days');
        
        // We only want to alert if it's past the deadline (i.e., daysOverdue >= 1)
        if (daysOverdue < 1) {
            continue;
        }

        // 2. Determine the time frame for contributions for this specific cycle
        const windowStart = deadline.clone().subtract(group.payoutInterval, 'days').startOf('day');
        const contributionAmount = group.contributionAmount;

        // 3. Check every member's payment status for the current cycle
        for (const member of group.members) {
            
            // Find successful contributions by this member within the current cycle's funding window
            const memberContributions = await Contribution.find({
                group: group._id,
                user: member.user._id,
                status: 'successful',
                createdAt: { $gte: windowStart.toDate(), $lte: now.toDate() } 
            });

            // Calculate total paid by this member in the window
            const totalPaid = memberContributions.reduce((acc, item) => acc + item.amount, 0);

            // If the total paid is less than the required amount
            if (totalPaid < contributionAmount) {
                
                // 4. Check if this specific WARNING has already been logged TODAY
                const existingWarning = await Alert.findOne({
                    group: group._id,
                    user: member.user._id,
                    type: 'warning',
                    // Check only alerts created since the start of today
                    createdAt: { $gte: moment().startOf('day').toDate() } 
                });

                // Only create the warning if it's new for today
                if (!existingWarning) {
                    const message = `Payment Overdue: ${member.user.firstName} ${member.user.lastName}'s contribution of ₦${contributionAmount.toLocaleString()} is ${daysOverdue} days overdue (Cycle #${currentCycleNumber}).`;
                    
                    await Alert.create({
                        group: group._id,
                        user: member.user._id, // Alert is specific to the member who missed payment
                        message: message,
                        type: 'warning',
                    });
                    console.log(`ALERT CREATED for overdue payment in group ${group.groupName}.`);

                    // --- NEW SOCKET.IO LOGIC (Trigger alert to the overdue member) ---
                    const memberSocketId = onlineUsers.get(member.user._id.toString());
                    
                    if (memberSocketId && io) {
                        io.to(memberSocketId).emit('newNotification', {
                            title: 'Critical Warning!',
                            message: `Your contribution of ₦${contributionAmount.toLocaleString()} is overdue.`,
                            link: `/group/${group._id}/alerts`
                        });
                        console.log(`[Socket.IO] Emitted 'newNotification' to overdue member: ${member.user._id}`);
                    }
                    // ------------------------------------------------------------------
                }
            }
        }
    }
    console.log('Overdue contributions check complete.');
};


// --- Initialization ---

/**
 * Starts the cron job to check for overdue payments daily.
 */
const startScheduler = () => {
    // Cron expression: '*/10 * * * *' runs every 10 minutes (for testing)
    cron.schedule('*0 */6 * * *', checkOverduePayments, {
        scheduled: true,
        timezone: "Africa/Lagos" 
    });

    // Run once immediately upon server start for testing/initial state
    checkOverduePayments(); 
    console.log('Alert Scheduler Initialized.');
};

module.exports = { startScheduler, checkOverduePayments };