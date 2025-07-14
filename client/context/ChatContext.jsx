import axios from "axios";
import { createContext, useContext } from "react";
import React, { useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import { useEffect } from "react";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { socket, axios, authUser } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unseenMessages, setUnseenMessages] = useState({});

  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages || {});
        console.log("Users fetched successfully:", data.users);
      } else {
        console.error("Failed to fetch users:", data.message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
        console.log("Messages fetched successfully:", data.messages);
      } else {
        console.error("Failed to fetch messages:", data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch messages");
    }
  };

  const sendMessage = async (messageData) => {
    try {
      if (!selectedUser?._id) {
        toast.error("No user selected");
        return;
      }
      const newMessage = {
        text: messageData.text,
        image: messageData.image,
        senderId: authUser._id,
        recieverId: selectedUser._id,
        seen: false,
        _id: Date.now().toString(), // Temporary ID for optimistic update
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMessage]); // Optimistic update
      const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
      if (!data.success) {
        setMessages((prev) => prev.filter((msg) => msg._id !== newMessage._id)); // Rollback on failure
        toast.error(data.message || "Failed to send message");
      } else {
        // Replace temporary ID with server-generated ID when confirmed
        setMessages((prev) =>
          prev.map((msg) => (msg._id === newMessage._id ? data.message : msg))
        );
      }
    } catch (error) {
      setMessages((prev) => prev.filter((msg) => msg._id !== newMessage._id)); // Rollback on error
      toast.error(error.message || "Failed to send message");
    }
  };

  const subscribeToMessages = (userId) => {
    if (!socket || !userId) return;

    socket.on("newMessage", (newMessage) => {
      console.log("💬 New message via socket:", newMessage);

      const isCurrentChat =
        selectedUser &&
        (selectedUser._id === newMessage.senderId || selectedUser._id === newMessage.recieverId);

      if (isCurrentChat) {
        const isReceiver = authUser._id === newMessage.recieverId;
        if (isReceiver) {
          newMessage.seen = true;
          setMessages((prev) => [...prev, newMessage]);

          if (newMessage._id) {
            console.log("Sending PUT for message ID:", newMessage._id);
            axios
              .put(`/api/messages/mark/${newMessage._id}`)
              .then(() => console.log("✅ Message marked as seen:", newMessage._id))
              .catch((err) => console.error("❌ Failed to mark seen:", err));
          } else {
            console.warn("⚠️ newMessage._id is missing, skipping PUT");
          }
        } else {
          setMessages((prev) => [...prev, newMessage]); // Add sender's message
        }
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId]
            ? prev[newMessage.senderId] + 1
            : 1,
        }));
      }
    });
  };

  const unsubscribeFromMessages = () => {
    if (!socket) return;
    socket.off("newMessage");
  };

  useEffect(() => {
    if (selectedUser?._id) {
      subscribeToMessages(selectedUser._id);
    }
    return () => {
      unsubscribeFromMessages();
    };
  }, [socket, selectedUser]);

  const value = {
    messages,
    users,
    selectedUser,
    unseenMessages,
    getUsers,
    sendMessage,
    setMessages,
    setSelectedUser,
    getMessages,
    setUnseenMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};