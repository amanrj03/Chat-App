import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getChatList,
  getMessages,
  searchUserByPhone,
  blockUser,
  unblockUser,
  checkBlockStatus
} from '../controllers/chatController.js';
import { deleteConversation } from '../controllers/deleteController.js';

const router = express.Router();

router.get('/chats', authenticateToken, getChatList);
router.get('/messages/:otherUserId', authenticateToken, getMessages);
router.get('/search', authenticateToken, searchUserByPhone);
router.post('/block', authenticateToken, blockUser);
router.post('/unblock', authenticateToken, unblockUser);
router.get('/block-status/:otherUserId', authenticateToken, checkBlockStatus);
router.delete('/conversation/:otherUserId', authenticateToken, deleteConversation);

export default router;
