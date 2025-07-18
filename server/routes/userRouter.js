import express from 'express';
import {
  signup,
  login,
  isAuthenticated,
  updateProfile,
} from '../controllers/userController.js';
import { protectRoute } from '../middleware/auth.js';
import { upload } from "../middleware/upload.js";


const UserRouter = express.Router();

UserRouter.post('/signup', signup);
UserRouter.post('/login', login);
UserRouter.get('/check', protectRoute, isAuthenticated);
UserRouter.put('/update-profile', protectRoute, upload.single("image"), updateProfile);

export default UserRouter;
