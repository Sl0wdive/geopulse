import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['public', 'private'], required: true },
    coordinates: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    category: { type: String, required: true },
    photos: [
        {
            url: { type: String, required: true },
            description: { type: String }
        }
    ],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    allowedGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]
});

locationSchema.index({ coordinates: '2dsphere' });

const Location = mongoose.model('Location', locationSchema);

export default Location;
