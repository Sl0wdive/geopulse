import express from 'express';
import Location from '../models/location.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/locations', auth, async (req, res) => {
    try {
        const location = new Location({
            ...req.body,
            createdBy: req.userId,
        });
        await location.save();
        res.status(201).send(location);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/locations', auth, async (req, res) => {
    try {
        const locations = await Location.find().populate('createdBy', 'fullName email');
        res.send(locations);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/locations/:id', auth, async (req, res) => {
    try {
        const location = await Location.findById(req.params.id).populate('createdBy', 'fullName email');
        if (!location) {
            return res.status(404).send();
        }
        res.send(location);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.put('/locations/:id', auth, async (req, res) => {
    try {
        const location = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!location) {
            return res.status(404).send();
        }
        res.send(location);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete('/locations/:id', auth, async (req, res) => {
    try {
        const location = await Location.findByIdAndDelete(req.params.id);
        if (!location) {
            return res.status(404).send();
        }
        res.send(location);
    } catch (error) {
        res.status(500).send(error);
    }
});

export default router;
