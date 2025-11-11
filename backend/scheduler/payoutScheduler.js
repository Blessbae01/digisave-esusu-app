// In backend/scheduler/payoutScheduler.js

const cron = require('node-cron');
const Group = require('../models/groupModel');
const Contribution = require('../models/contributionModel');
const Alert = require('../models/alertModel');
const moment = require('moment'); // For accurate date calculations

// Helper function: Logic to determine the next member and their expected date
const getNextPayoutInfo = async (group) => {
    // 1. Calculate the number of payouts already executed
    const payouts = await Contribution.find({ 
        group: group._id, 
        method: 'payout', 
        status: 'successful' 
    });
    const executedPayouts = payouts.length;

    // The next member is based on the 1-based index: executedPayouts + 1
    const nextPayoutNumber = executedPayouts + 1;

    if (nextPayoutNumber > group.numberOfMembers) {
        return { isComplete: true };
    }

    // 2. Find the member corresponding to that number
    const memberToPay = group.members.find(
        member => Number(member.chosenNumber) === nextPayoutNumber
    );

    // 3. Calculate the expected payout date
    const startingDate = moment(group.startingDate);
    const payoutInterval = group.payoutInterval; // in days
    
    // Days to add: (nextPayoutNumber - 1) * payoutInterval
    const daysToAdd = (nextPayoutNumber - 1) * payoutInterval;
    const expectedPayoutDate = startingDate.clone().add(daysToAdd, 'days').endOf('day');
    
    return { nextPayoutNumber, memberToPay, expectedPayoutDate };
};

// Main function to check and execute payouts
const processScheduledPayouts = async () => {
    console.log('Running automatic payout check...');
    const today = moment();

    // Find all active groups
    const activeGroups = await Group.find({ status: 'Active' }).populate('members.user');

    for (const group of activeGroups) {
        const info = await getNextPayoutInfo(group);
        
        if (info.isComplete) {
            group.status = 'Completed';
            await group.save();
            console.log(`Group COMPLETED: ${group.groupName}`); 
            continue;
        }

        const { nextPayoutNumber, memberToPay, expectedPayoutDate } = info;
        console.log(`Group: ${group.groupName}, Next Payout Member: #${nextPayoutNumber}`); 
        console.log(`Expected Date: ${expectedPayoutDate.format('YYYY-MM-DD')}, Today: ${today.format('YYYY-MM-DD')}`);
        
        // --- 1. Check Date Condition ---
        if (today.isBefore(expectedPayoutDate, 'day')) {
            console.log('STATUS: FAILED DATE CHECK. Date not yet reached.');
            continue;
        }
        console.log('STATUS: PASSED DATE CHECK.');

        // --- 2. Check Fund Condition (Pooled Funds) ---
        const totalContributed = await Contribution.aggregate([
            { $match: { group: group._id, status: 'successful' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const fundsCollected = totalContributed[0] ? totalContributed[0].total : 0;

        console.log(`Funds: ₦${fundsCollected.toLocaleString()}. Required: ₦${group.payoutAmount.toLocaleString()}.`);
        
        if (fundsCollected < group.payoutAmount) {
            console.log('STATUS: FAILED FUNDS CHECK (Pool).');
            await Alert.create({
                group: group._id,
                message: `CRITICAL: Payout due for Member #${nextPayoutNumber} on ${expectedPayoutDate.format('YYYY-MM-DD')} but only ₦${fundsCollected.toLocaleString()} of ₦${group.payoutAmount.toLocaleString()} collected.`,
                type: 'critical',
            });
            continue;
        }
        console.log('STATUS: PASSED FUNDS CHECK (Pool).');


        // --- CRUCIAL NEW CHECK: Individual Member Contribution Compliance (Check 3) ---
        const deadline = expectedPayoutDate;
        const windowStart = deadline.clone().subtract(group.payoutInterval, 'days').startOf('day');
        const requiredAmount = group.contributionAmount;
        
        let compliant = true;
        const overdueMembers = []; // Array to hold all non-compliant members

        for (const member of group.members) {
            // Calculate member's paid amount in the current funding window
            const memberPaid = await Contribution.aggregate([
                { $match: { 
                    group: group._id, 
                    user: member.user._id, 
                    status: 'successful', 
                    method: { $ne: 'payout' }, // Exclude payout entries
                    createdAt: { $gte: windowStart.toDate(), $lte: deadline.toDate() } 
                }},
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            
            const totalPaidInCycle = memberPaid[0] ? memberPaid[0].total : 0;
            
            if (totalPaidInCycle < requiredAmount) {
                compliant = false;
                // Add member details to the array
                overdueMembers.push({
                    name: `${member.user.firstName} ${member.user.lastName}`,
                    amountShort: requiredAmount - totalPaidInCycle,
                    payoutNumber: member.chosenNumber
                });
                // Continue the loop to find all other overdue members
            }
        }

        // --- 4. Final Payout Decision ---
        if (!compliant) {
            // 1. Format the list of overdue members for the alert message
            const memberListString = overdueMembers.map(m => 
                `${m.name} (Num: ${m.payoutNumber}, Short: ₦${m.amountShort.toLocaleString()})`
            ).join('; '); 

            // 2. Block Payout and generate a comprehensive CRITICAL alert
            console.log(`STATUS: FAILED COMPLIANCE CHECK. ${overdueMembers.length} member(s) are short.`);

            await Alert.create({
                group: group._id,
                message: `CRITICAL: Payout blocked! ${overdueMembers.length} member(s) have incomplete contributions for the current cycle (₦${requiredAmount.toLocaleString()} required per member). Overdue: ${memberListString}`,
                type: 'critical', 
            });
            // Stop the scheduler for this group
            continue; 
        }
        console.log('STATUS: PASSED COMPLIANCE CHECK. Executing Payout.');

        // --- 5. Execute Payout (If Date, Funds, and Compliance are GO) ---
        console.log('!!! SUCCESS: EXECUTING PAYOUT...');
        
        // Payout Execution is simulated for this environment.
        const payoutRecord = {
            group: group._id,
            user: memberToPay.user._id,
            amount: -group.payoutAmount, // NEGATIVE AMOUNT for deduction
            method: 'payout', 
            status: 'successful',
            reference: `AUTO-PAYOUT-${nextPayoutNumber}-${Date.now()}`
        };

        await Contribution.create(payoutRecord);
        
        // 6. Generate Success Alert
        await Alert.create({
            group: group._id,
            user: memberToPay.user._id,
            message: `AUTOMATIC PAYOUT executed successfully for Member #${nextPayoutNumber} (${memberToPay.user.firstName} ${memberToPay.user.lastName}). Funds transferred.`,
            type: 'notice',
        });
        
        console.log(`AUTO PAYOUT EXECUTED for Group: ${group.groupName}, Member: #${nextPayoutNumber}`);
    }
    console.log('Automatic payout check finished.');
};

// --- Initialization ---
const startPayoutScheduler = () => {
    // Run the check every 10 seconds for testing purposes.
    cron.schedule('0 */6 * * *', processScheduledPayouts, {
        scheduled: true,
        timezone: "Africa/Lagos" 
    });

    // Run once immediately upon server start for testing/catch-up
    processScheduledPayouts(); 
    console.log('Automatic Payout Scheduler Initialized.');
};

module.exports = { startPayoutScheduler };