import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getProfile, updateProfile, changePassword, getUserById } from '../controllers/userController.js';

const router = express.Router();

router.get('/profile', authenticateToken, getProfile);
router.get('/:userId', authenticateToken, getUserById);
router.put('/profile', authenticateToken, updateProfile);
router.put('/password', authenticateToken, changePassword);

export default router;
