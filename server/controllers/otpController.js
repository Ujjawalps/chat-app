import nodemailer from 'nodemailer';
import Otp from '../models/otp.js';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your Gmail
    pass: process.env.EMAIL_PASS, // app password
  },
});

export const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  try {
    const otp = generateOTP();

    // Save OTP to DB with expiration
    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min expiry
    });

    // Send email
    await transporter.sendMail({
      from: `"Chat App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code',
      html: `<h3>Your OTP is: ${otp}</h3><p>Expires in 5 minutes.</p>`,
    });

    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP required' });

  try {
    const record = await Otp.findOne({ email, otp });

    if (!record || record.expiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    await Otp.deleteMany({ email }); // cleanup

    res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
};
