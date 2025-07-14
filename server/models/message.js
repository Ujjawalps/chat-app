import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true,
  },
  recieverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: false, // ✅ Make this optional
  },
  image: {
    type: String,
    required: false,
  },
  seen: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

export default Message;
