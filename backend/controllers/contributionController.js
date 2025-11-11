// In backend/controllers/contributionController.js

const asyncHandler = require('express-async-handler');
const Contribution = require('../models/contributionModel');
const Group = require('../models/groupModel');
const Alert = require('../models/alertModel');
const axios = require('axios'); // We need this to talk to Paystack

// ---
// Step 2: Modify logTransfer (Manual Payment)
// ---
/**
 * @desc    Log a manual bank transfer
 * @route   POST /api/contributions/transfer
 * @access  Private
 */
const logTransfer = asyncHandler(async (req, res) => {
    const { groupId, amount, method } = req.body;
    // Get the full user object from the request
    const user = req.user; 
    const userId = user._id;

    if (!groupId || !amount || !method) {
        res.status(400);
        throw new Error('Missing contribution data');
    }

    // Create the contribution
    const contribution = await Contribution.create({
        group: groupId,
        user: userId,
        amount: Number(amount),
        method: 'transfer',
        reference: `transfer-${Date.now()}`,
        status: 'successful', // Assuming manual transfers are logged as successful immediately (awaiting admin confirmation)
    });

    if (contribution) {
        // Alert creation logic for Manual Transfer
        await Alert.create({
            group: groupId,
            user: user._id,
            message: `${user.firstName} ${user.lastName} logged a transfer of ₦${Number(amount).toLocaleString()}. Admin must verify.`,
            type: 'notice',
        });

        res.status(201).json(contribution);
    } else {
        res.status(400);
        throw new Error('Invalid contribution data');
    }
});

// ---
// Step 3: Modify verifyContribution (Card Payment)
// ---
/**
 * @desc    Verify a Paystack payment and log it
 * @route   POST /api/contributions/verify
 * @access  Private
 */
const verifyContribution = asyncHandler(async (req, res) => {
    const { reference, groupId, amount } = req.body;
    const user = req.user;
    const userId = user._id;

    if (!reference || !groupId || !amount) {
        res.status(400);
        throw new Error('Verification data missing');
    }

    // 1. Call Paystack's API with our Secret Key
    const paystackUrl = `https://api.paystack.co/transaction/verify/${reference}`;
    const config = {
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
    };

    try {
        const { data } = await axios.get(paystackUrl, config);
        const paystackData = data.data;

        // 2. Check if Paystack says it was successful
        if (paystackData.status === 'success') {
            // 3. Check if the amount matches (Paystack sends in kobo)
            if (paystackData.amount / 100 !== Number(amount)) {
                res.status(400);
                throw new Error('Amount paid does not match contribution amount');
            }

            // 4. Check if we already logged this reference ID
            const existing = await Contribution.findOne({ reference: reference });
            if (existing) {
                res.status(400);
                throw new Error('This transaction has already been logged');
            }

            // 5. All checks passed. Log the contribution.
            const contribution = await Contribution.create({
                group: groupId,
                user: userId,
                amount: Number(amount),
                method: 'card',
                reference: reference,
                status: 'successful',
            });

            // Alert creation logic for Card Payment
            const verifiedAmount = Number(amount); 

            await Alert.create({
                group: groupId,
                user: user._id,
                message: `Contribution of ₦${verifiedAmount.toLocaleString()} confirmed via Card.`,
                type: 'notice',
            });

            res.status(201).json(contribution);
        } else {
            res.status(400);
            throw new Error('Payment verification failed');
        }
    } catch (error) {
        console.error(error);
        res.status(500);
        throw new Error('Server error during payment verification');
    }
});

/**
 * @desc    Get the total contribution balance for a group
 * @route   GET /api/contributions/group/:groupId/total
 * @access  Private
 */
const getGroupBalance = asyncHandler(async (req, res) => {
    const contributions = await Contribution.find({
        group: req.params.groupId,
        status: 'successful',
    });
    // This correctly sums positive contributions and subtracts negative payouts
    const total = contributions.reduce((acc, item) => acc + item.amount, 0); 
    res.status(200).json({ totalBalance: total });
});

/**
 * @desc    Get the logged-in user's total contribution balance
 * @route   GET /api/contributions/group/:groupId/my-balance
 * @access  Private
 */
const getMyBalance = asyncHandler(async (req, res) => {
    const contributions = await Contribution.find({
        group: req.params.groupId,
        user: req.user._id,
        status: 'successful',
    });
    const total = contributions.reduce((acc, item) => acc + item.amount, 0);
    res.status(200).json({ myBalance: total });
});

/**
 * @desc    Get all contribution history for a group
 * @route   GET /api/contributions/group/:groupId/history
 * @access  Private
 */
const getGroupContributionHistory = asyncHandler(async (req, res) => {
    const contributions = await Contribution.find({
        group: req.params.groupId,
        status: 'successful',
    })
        .populate('user', 'firstName lastName') // Get the user's name
        .sort({ createdAt: -1 }); // Show newest first

    res.status(200).json(contributions);
});

/**
 * @desc    Get the logged-in user's contribution history for a group
 * @route   GET /api/contributions/group/:groupId/my-history
 * @access  Private
 */
const getMyContributionHistory = asyncHandler(async (req, res) => {
    const contributions = await Contribution.find({
        group: req.params.groupId,
        user: req.user._id,
        status: 'successful',
    })
        .populate('user', 'firstName lastName')
        .sort({ createdAt: -1 });

    res.status(200).json(contributions);
});

// Export all the functions
module.exports = {
    logTransfer,
    verifyContribution,
    getGroupBalance,
    getMyBalance,
    getGroupContributionHistory,
    getMyContributionHistory,
};