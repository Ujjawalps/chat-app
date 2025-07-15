import express from 'express';
import {
  getUsersForSidebar,
  getMessages,
  markMessagesAsSeen,
  sendMessage,
  markAllMessagesAsSeen,
} from '../controllers/messageController.js';
import { protectRoute } from '../middleware/auth.js';

const messageRouter = express.Router();

messageRouter.get('/users', protectRoute, getUsersForSidebar);
messageRouter.get('/:id', protectRoute, getMessages);
messageRouter.put('/mark/:id', protectRoute, markMessagesAsSeen);
messageRouter.post('/send/:id', protectRoute, sendMessage);
messageRouter.put('/mark-all/:id', protectRoute, markAllMessagesAsSeen);

export default messageRouter;
