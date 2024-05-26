import express from 'express';
import mongoose from 'mongoose';
import Invitation from '../models/invitation.js';
import auth from '../middleware/auth.js';

const router = express.Router();


router.post('/invitations', auth, async (req, res) => {
    try {
        const { group, invitee } = req.body;

        console.log('Request body:', req.body);
        console.log('User ID:', req.userId);

        if (!mongoose.Types.ObjectId.isValid(group) || !mongoose.Types.ObjectId.isValid(invitee)) {
            console.log('Invalid ObjectId');
            return res.status(400).send({ message: 'Invalid ObjectId for group or invitee' });
        }

        const invitation = new Invitation({
            group: new mongoose.Types.ObjectId(group),
            invitee: new mongoose.Types.ObjectId(invitee),
            createdBy: new mongoose.Types.ObjectId(req.userId),
        });

        await invitation.save();
        res.status(201).send(invitation);
    } catch (error) {
        console.error('Error saving invitation:', error);
        res.status(400).send({ message: error.message });
    }
});

router.get('/invitations', auth, async (req, res) => {
    try {
        const invitations = await Invitation.find().populate('group invitee createdBy', 'name email');
        res.send(invitations);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/invitations/:id', auth, async (req, res) => {
    try {
        const invitation = await Invitation.findById(req.params.id).populate('group invitee createdBy', 'name email');
        if (!invitation) {
            return res.status(404).send(); 
        }
        res.send(invitation);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.put('/invitations/:id', auth, async (req, res) => {
    try {
        const { group, invitee, ...updateFields } = req.body;
        const updateData = {
            ...updateFields,
        };
        if (group) {
            updateData.group = new mongoose.Types.ObjectId(group);
        }
        if (invitee) {
            updateData.invitee = new mongoose.Types.ObjectId(invitee);
        }
        const invitation = await Invitation.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!invitation) {
            return res.status(404).send();
        }
        res.send(invitation);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete('/invitations/:id', auth, async (req, res) => {
    try {
        const invitation = await Invitation.findByIdAndDelete(req.params.id);
        if (!invitation) {
            return res.status(404).send();
        }
        res.send(invitation);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post('/invitations/:id/accept', auth, async (req, res) => {
    try {
        const invitation = await Invitation.findById(req.params.id);
        if (!invitation) {
            return res.status(404).send();
        }
        if (invitation.invitee.toString() !== req.userId) {
            return res.status(403).send({ message: 'You do not have permission to accept this invitation' });
        }
        invitation.status = 'accepted';
        await invitation.save();
        res.send(invitation);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post('/invitations/:id/reject', auth, async (req, res) => {
    try {
        const invitation = await Invitation.findById(req.params.id);
        if (!invitation) {
            return res.status(404).send();
        }
        if (invitation.invitee.toString() !== req.userId) {
            return res.status(403).send({ message: 'You do not have permission to reject this invitation' });
        }
        await Invitation.findByIdAndDelete(req.params.id);
        res.send({ message: 'Invitation rejected and deleted' });
    } catch (error) {
        res.status(500).send(error);
    }
});

export default router;
