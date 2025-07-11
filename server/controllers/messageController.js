import Message from "../models/message.js";
import User from "../models/user.js";
import cloudinary from "../lib/cloudinary.js";
import { response } from "express";
import { userSocketMap, io } from "../server.js";

//get all users except the logged-in user
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user.id;
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");

    //count the number of messages not seen by the user
    const unseenMessagesCount = {}

    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({senderId: user._id, recieverId: userId, seen: false});
      if(messages.length > 0) {
        unseenMessagesCount[user._id] = messages.length;
      }
    });
    await Promise.all(promises);

    res.status(200).json({success: true, users: filteredUsers, unseenMessagesCount});
  } catch (error) {
    console.error("Error fetching users for sidebar:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//get all  messages for selected user
export const getMessages = async (req, res) => {
    try {
        const {id: selectedUserId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, recieverId: selectedUserId },
                { senderId: selectedUserId, recieverId: myId }
            ]
        })
        await Message.updateMany({ senderId: selectedUserId, recieverId: myId }, { seen: true });
        res.json({success: true, messages});

    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

// api to mark messages as seen
export const markMessagesAsSeen = async (req, res) => {
  try {
    const { id } = req.body;
    await Message.findByIdAndUpdate(id, { seen: true });
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as seen:", error);
    res.status(500).json({ success: false, message: "Server error" });
    
  }
}

// send message to selected user
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const recieverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl;
    if(image){
      const uploadResponse = await cloudinary.uploader.upload(image,);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = await Message.create({
      text,
      image: imageUrl,
      senderId,
      recieverId,
    })
    // Emit the new message to the recipient's socket
    const recipientSocketId = userSocketMap[recieverId];
    if(recipientSocketId){
      io.to(recipientSocketId).emit("newMessage", newMessage);
    }
    res.json({ success: true, newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}