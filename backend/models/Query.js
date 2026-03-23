const mongoose = require('mongoose');

const querySchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, 'Please provide your full name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide your email address'],
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email address',
            ],
            lowercase: true,
        },
        phoneNumber: {
            type: String,
        },
        preferredDestination: {
            type: String,
            trim: true,
        },
        travelDates: {
            type: String,
        },
        numberOfTravelers: {
            type: String,
        },
        dreamTripDetails: {
            type: String,
            required: [true, 'Please share your dream trip details'],
            trim: true,
        },
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'resolved'],
            default: 'pending'
        }
    },
    {
        timestamps: true,
    }
);

const Query = mongoose.model('Query', querySchema);

module.exports = Query;
