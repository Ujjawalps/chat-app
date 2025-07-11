import express from 'express';
import { isAuthenticated, login, signup, updateProfile } from '../controllers/userController.js';
import { protectRoute } from '../middleware/auth.js';

const UserRouter = express.Router();

UserRouter.post('/signup', signup);
UserRouter.post('/login', login);
UserRouter.get('/check', protectRoute, isAuthenticated);
UserRouter.put('/update-profile', protectRoute, updateProfile);


export default UserRouter;
