import express from 'express';
import auth from '../middleware/auth.js';
import { createLocation, getLocations, getLocation, updateLocation, deleteLocation } from '../controllers/locations.js';

const router = express.Router();

router.post('/locations', auth, createLocation);
router.get('/locations', auth, getLocations);
router.get('/locations/:id', auth, getLocation);
router.put('/locations/:id', auth, updateLocation);
router.delete('/locations/:id', auth, deleteLocation);

export default router;
