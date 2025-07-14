import Message from "../models/message.js";
import User from "../models/user.js";
import cloudinary from "../lib/cloudinary.js";
import { userSocketMap, io } from "../server.js";

// 🔹 GET ALL USERS EXCEPT SELF + UNSEEN MESSAGE COUNT
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
    console.error("🚨 Error fetching users for sidebar:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔹 FETCH CHAT MESSAGES BETWEEN LOGGED-IN USER AND SELECTED USER
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

    // Uncomment to mark all unseen messages as seen when fetching
    // await Message.updateMany(
    //   { senderId: selectedUserId, recieverId: myId, seen: false },
    //   { seen: true }
    // );

    res.json({ success: true, messages });
  } catch (error) {
    console.error("🚨 Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔹 MARK INDIVIDUAL MESSAGE AS SEEN
export const markMessagesAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🧠 markMessagesAsSeen called with ID:", id);

    const updated = await Message.findByIdAndUpdate(id, { seen: true });

    if (!updated) {
      console.warn("❌ Message not found:", id);
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    console.log("✅ Message marked as seen:", updated._id);
    res.json({ success: true });
  } catch (error) {
    console.error("🔥 Error marking messages as seen:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔹 SEND A NEW MESSAGE
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
    console.error("🔥 Error sending message:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};