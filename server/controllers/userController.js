import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/utils';
import cloudinary from '../lib/cloudinary.js';

//signup new user
export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;
    try {
        if(!fullName || !email || !password || !bio) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const user = await User.findOne({ email });
        if(user) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            bio
        })

        const token = generateToken(newUser._id);

        res.json({ success: true, userData: newUser, token, message: "User created successfully" });



    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

//login user

export const login = async (req, res) => {

    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken(user._id);
        res.json({ success: true, userData: user, token, message: "Login successful" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
        
    }
}

// controller to check if user is authenticated
export const isAuthenticated = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        res.json({ success: true, userData: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

// controller to update user profile
export const updateProfile = async (req, res) => {
    
    try {
        const { fullName, profilePic, bio } = req.body;
        const user = req.user._id;
        let updatedData;

        if(!profilePic) {
            updatedData = await User.findByIdAndUpdate(user, { fullName, bio }, { new: true });
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedData = await User.findByIdAndUpdate(user, { profilePic: upload.secure_url, bio, fullName }, { new: true });
        }
        res.json({ success: true, user: updatedData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}