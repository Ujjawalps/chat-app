import axios from "axios";
import { createContext, useContext } from "react";
import React, { useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import { useEffect } from "react";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

    const {socket, axios} = useContext(AuthContext);

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [unseenMessages, setUnseenMessages] = useState({});

    // get all users from sidebar
    const getUsers = async () => {
        try {
            const {data} = await axios.get('/api/messages/users');
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
    }

    // fetch messages for the selected user
    const getMessages = async (userId) => {
        try {
            const {data} = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);
                console.log("Messages fetched successfully:", data.messages);
            } else {
                console.error("Failed to fetch messages:", data.message);
            }
        } catch (error) {
            toast.error(error.message || "Failed to fetch messages");
        }
    }

    // send a message to the selected user

    const sendMessage = async (messageData) => {
        try {
            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
            if(data.success) {
                setMessages((prevMessages) => [...prevMessages, data.message]);
            }else {
                toast.error(data.message || "Failed to send message");
            }
            
        } catch (error) {
            toast.error(error.message || "Failed to send message");
        }
    }

    // subscibe to messages for selected user
    const subscribeToMessages = (userId) => {
        if (!socket || !userId) return;

        socket.on("newMessage", (newMessage) => {
            if(selectedUser && selectedUser.senderId === newMessage.senderId) {
                newMessage.seen = true;
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }else {
                setUnseenMessages((prev) => ({
                    ...prev,
                    [newMessage.senderId]: prev[newMessage.senderId] ? prev[newMessage.senderId] +1 : 1
                }))
            }
        })
    }

    // unsubscribe from messages
    const unsubscribeFromMessages = () => {
        if (!socket) return;

        socket.off("newMessage");
    }

    useEffect(() => {
        subscribeToMessages();
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
        getMessages
    }

    return(
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}

