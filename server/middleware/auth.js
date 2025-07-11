import User from '../models/user.js';
import jwt from 'jsonwebtoken';
export const protectRoute = async (req, res, next) => {
    try {
        const token = req.headers.token;
        if (!token) {
            console.log('No token provided');
            return res.status(401).json({ success: false, message: 'No token provided' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);
        const user = await User.findById(decoded.user._id).select('-password');
        if (!user) {
            console.log('User not found for ID:', decoded.user._id);
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        res.status(401).json({ success: false, message: 'Unauthorized' });
    }
};