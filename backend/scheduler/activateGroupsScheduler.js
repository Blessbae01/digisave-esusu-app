// backend/scheduler/activateGroupsScheduler.js

const cron = require('node-cron');
const Group = require('../models/groupModel');
const moment = require('moment');

// Function to check and activate pending groups
const activatePendingGroups = async () => {
    console.log('🔄 Checking for groups to activate...');

    const today = moment().startOf('day');

    // Find all groups that are pending and startingDate <= today
    const pendingGroups = await Group.find({ status: 'Pending' });

    for (const group of pendingGroups) {
        const startingDate = moment(group.startingDate).startOf('day');

        if (startingDate.isSameOrBefore(today)) {
            group.status = 'Active';
            await group.save();
            console.log(`✅ Group Activated: ${group.groupName} (ID: ${group._id})`);
        }
    }

    console.log('🎯 Group activation check complete.');
};

// Scheduler to run every minute (for testing)
const startActivateGroupsScheduler = () => {
    cron.schedule('*0 */6 * * *', activatePendingGroups, {
        scheduled: true,
        timezone: 'Africa/Lagos'
    });

    // Run immediately on server start
    activatePendingGroups();
    console.log('⏰ Activate Groups Scheduler Initialized.');
};

module.exports = { startActivateGroupsScheduler };
