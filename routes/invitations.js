import express from 'express';
import { inviteUserToGroup, acceptInvitation, rejectInvitation } from '../controllers/invitations.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/invitations', auth, inviteUserToGroup);
router.post('/invitations/:invitationId/accept', auth, acceptInvitation);
router.post('/invitations/:invitationId/reject', auth, rejectInvitation);

export default router;
