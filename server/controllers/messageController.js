import Message from "../models/message.js";
import User from "../models/user.js";
import cloudinary from "../lib/cloudinary.js";
import { userSocketMap, io } from "../server.js";

// Get all users except the logged-in user + unseen message count
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user.id;
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");

    const unseenMessagesCount = {};

    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        recieverId: userId,
        seen: false,
      });
      if (messages.length > 0) {
        unseenMessagesCount[user._id] = messages.length;
      }
    });

    await Promise.all(promises);

    res.status(200).json({ success: true, users: filteredUsers, unseenMessagesCount });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all messages between two users
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, recieverId: selectedUserId },
        { senderId: selectedUserId, recieverId: myId },
      ],
    });

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Mark a single message as seen
export const markMessagesAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Message.findByIdAndUpdate(id, { seen: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Send message to selected user
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const recieverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      text,
      image: imageUrl,
      senderId,
      recieverId,
      seen: false,
    });

    const recipientSocketId = userSocketMap[recieverId];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newMessage", newMessage);
    }

    res.json({ success: true, message: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
