import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/utils';

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