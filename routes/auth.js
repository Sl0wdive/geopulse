import express from 'express';
import { register, login, me } from '../controllers/auth.js';
import auth from '../middleware/auth.js';
import { sanitizeBody } from '../middleware/sanitize.js';

const router = express.Router();

router.post('/register', sanitizeBody, register);
router.post('/login', sanitizeBody, login);
router.get('/me', auth, me);

export default router;
