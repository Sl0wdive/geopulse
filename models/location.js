import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema({
    url: { type: String, required: true },
    description: { type: String }
});

const locationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    allowedGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    type: { type: String, enum: ['public', 'private'], default: 'private' },
    photos: [photoSchema]
});

const Location = mongoose.model('Location', locationSchema);

export default Location;
