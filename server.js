import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import logger from './config/logger.js';
import redisClient from './config/redis.js';
import authRoutes from './routes/auth.js';
import invitationRoutes from './routes/invitations.js';
import locationRoutes from './routes/locations.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
    throw new Error("MONGODB_URL environment variable is not defined");
}

app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log(`Directory 'uploads' created at: ${uploadsDir}`);
} else {
    console.log(`Directory 'uploads' already exists at: ${uploadsDir}`);
}

app.use('/uploads', express.static(uploadsDir));
app.use('/api/auth', authRoutes);
app.use('/api', invitationRoutes);
app.use('/api', locationRoutes);

const cache = (req, res, next) => {
    const key = req.originalUrl;
    redisClient.get(key, (err, data) => {
        if (err) {
            logger.error('Redis error:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        if (data !== null) {
            return res.json(JSON.parse(data));
        }
        next();
    });
};

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
    .catch((error) => console.log(`${error} did not connect`));

export default app;
