import express from 'express';
import auth from '../middleware/auth.js';
import { createLocation, getLocations, getLocation, updateLocation, deleteLocation, getPhotos, uploadPhotos, addPhotos, searchNearbyLocations } from '../controllers/locations.js';
import { addReview, getReviews } from '../controllers/reviews.js';

const router = express.Router();

router.post('/locations', auth, createLocation);
router.get('/locations', auth, getLocations);
router.get('/locations/:id', auth, getLocation);
router.put('/locations/:id', auth, updateLocation);
router.delete('/locations/:id', auth, deleteLocation);

router.post('/locations/:id/reviews', auth, addReview);
router.get('/locations/:id/reviews', auth, getReviews);

router.post('/locations/:id/photos', auth, uploadPhotos, addPhotos);
router.get('/locations/:id/photos', auth, getPhotos);

router.get('/location/search', auth, searchNearbyLocations);

export default router;
