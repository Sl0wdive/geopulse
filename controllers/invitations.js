import Invitation from '../models/invitation.js';
import Group from '../models/group.js';
import User from '../models/user.js';

export const inviteUserToGroup = async (req, res) => {
    try {
        const { groupId, inviteeId } = req.body;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const invitee = await User.findById(inviteeId);
        if (!invitee) {
            return res.status(404).json({ message: 'User not found' });
        }

        const invitation = new Invitation({
            group: groupId,
            invitee: inviteeId,
            inviter: req.userId,
        });

        await invitation.save();

        res.status(201).json(invitation);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error sending invitation' });
    }
};

export const acceptInvitation = async (req, res) => {
    try {
        const invitationId = req.params.invitationId;
        const invitation = await Invitation.findById(invitationId);

        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        const group = await Group.findById(invitation.group);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        group.members.push(invitation.invitee);
        await group.save();

        await Invitation.findByIdAndDelete(invitationId);

        res.status(200).json({ message: 'Invitation accepted' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error accepting invitation' });
    }
};

export const rejectInvitation = async (req, res) => {
    try {
        const invitationId = req.params.invitationId;

        await Invitation.findByIdAndDelete(invitationId);

        res.status(200).json({ message: 'Invitation rejected' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error rejecting invitation' });
    }
};
