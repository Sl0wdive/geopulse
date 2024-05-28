import jwt from 'jsonwebtoken';
import UserModel from '../models/user.js';

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'password333');
        const user = await UserModel.findById(decoded._id);

        if (!user) {
            throw new Error();
        }

        req.userId = user._id;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate.' });
    }
};

export default auth;
