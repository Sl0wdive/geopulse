import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['public', 'private'],
        default: 'public',
    },
    category: {
        type: String,
        required: true,
    },
    coordinates: {
        latitude: {
            type: Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true,
        },
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    allowedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    allowedGroups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
    }],
}, {
    timestamps: true,
});

const Location = mongoose.model('Location', locationSchema);

export default Location;
