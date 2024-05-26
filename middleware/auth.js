import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
        return res.status(401).send({ error: 'Not authorized to access this resource' });
    }

    try {
        const decoded = jwt.verify(token, 'password333');
        req.userId = decoded._id;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Not authorized to access this resource' });
    }
};

export default auth;
