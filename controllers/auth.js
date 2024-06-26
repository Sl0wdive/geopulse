import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import UserModel from '../models/user.js';
import { check, validationResult } from 'express-validator';
import sanitizeHtml from 'sanitize-html';


export const register = [
    check('email').isEmail().withMessage('Enter a valid email'),
    check('fullName').isLength({ min: 2 }).withMessage('Enter your name'),
    check('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            console.log('Received registration data:', req.body);

            const password = req.body.password;
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            const sanitizedFullName = sanitizeHtml(req.body.fullName);
            const sanitizedUsername = sanitizeHtml(req.body.username);

            const doc = new UserModel({
                email: req.body.email,
                fullName: sanitizedFullName,
                username: sanitizedUsername,
                passwordHash: hash,
            });

            const user = await doc.save();

            const token = jwt.sign({ _id: user._id }, 'password333', { expiresIn: '30d' });

            const { passwordHash, ...userData } = user._doc;

            res.json({ ...userData, token });
        } catch (err) {
            console.log('Error during registration:', err);
            res.status(500).json({ message: 'Error occurred during registration' });
        }
    }
];

export const login = [
    check('email').isEmail().withMessage('Enter a valid email'),
    check('password').not().isEmpty().withMessage('Password is required'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

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
    }
];

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