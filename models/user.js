import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    createdAt: {
        type: Date,
        default: new Date(),
    },
});

const User = mongoose.model('User', userSchema);

export default User;
