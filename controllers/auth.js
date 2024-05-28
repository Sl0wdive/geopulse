import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import UserModel from '../models/user.js';

export const register = async (req, res) => {
    try {
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const doc = new UserModel({
            email: req.body.email,
            fullName: req.body.fullName,
            username: req.body.username, // Додавання username
            passwordHash: hash,
        });

        const user = await doc.save();

        const token = jwt.sign({ _id: user._id }, 'password333', { expiresIn: '30d' });

        const { passwordHash, ...userData } = user._doc;

        res.json({ ...userData, token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error occurred during registration' });
    }
};

export const login = async (req, res) => {
    try {
        const user = await UserModel.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ message: 'Invalid user' });
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, user._doc.passwordHash);

        if (!isPasswordValid) {
            return res.status(404).json({ message: 'Invalid login or password' });
        }

        const token = jwt.sign({ _id: user._id }, 'password333', { expiresIn: '30d' });

        const { passwordHash, ...userData } = user._doc;

        res.json({ ...userData, token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error occurred during login' });
    }
};

export const me = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'Invalid user' });
        }

        const { passwordHash, ...userData } = user._doc;

        res.json(userData);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'No access' });
    }
};
