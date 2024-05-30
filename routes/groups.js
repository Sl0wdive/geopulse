import express from 'express';
import Group from '../models/group.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/groups', auth, async (req, res) => {
    try {
        const group = new Group({
            ...req.body,
            createdBy: req.userId,
            members: [req.userId],
        });
        await group.save();
        res.status(201).send(group);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post('/groups/:id/locations', auth, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).send({ error: 'Group not found' });
        }

        group.locations.push(req.body.locationId);
        await group.save();
        res.send(group);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/groups', auth, async (req, res) => {
    try {
        const groups = await Group.find({ members: req.userId })
            .populate('members', 'fullName email')
            .populate('locations');
        
        res.status(200).json(groups);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/groups/:id/join', auth, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).send({ error: 'Group not found' });
        }

        if (!group.members.includes(req.userId)) {
            group.members.push(req.userId);
            await group.save();
        }

        res.send(group);
    } catch (error) {
        res.status(400).send(error);
    }
});

export default router;
