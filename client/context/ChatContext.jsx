import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { socket, axios, authUser } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (error) {
      toast.error("Failed to load users");
    }
  };

  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error("Failed to fetch messages");
    }
  };

  const sendMessage = async (messageData) => {
    if (!selectedUser?._id) {
      toast.error("No user selected");
      return;
    }

    const tempId = Date.now().toString();
    const newMessage = {
      text: messageData.text,
      image: messageData.image,
      senderId: authUser._id,
      recieverId: selectedUser._id,
      seen: false,
      _id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);

    try {
      const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
      if (data.success) {
        setMessages((prev) =>
          prev.map((msg) => (msg._id === tempId ? data.message : msg))
        );
      } else {
        setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
        toast.error("Failed to send message");
      }
    } catch (error) {
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
      toast.error("Failed to send message");
    }
  };

  const subscribeToMessages = (userId) => {
    if (!socket || !userId) return;

    socket.on("newMessage", (newMessage) => {
      const isCurrentChat =
        selectedUser &&
        (selectedUser._id === newMessage.senderId || selectedUser._id === newMessage.recieverId);

      if (isCurrentChat) {
        const isReceiver = authUser._id === newMessage.recieverId;
        if (isReceiver) {
          newMessage.seen = true;
          setMessages((prev) => [...prev, newMessage]);

          if (newMessage._id) {
            axios.put(`/api/messages/mark/${newMessage._id}`).catch(() => {});
          }
        } else {
          setMessages((prev) => [...prev, newMessage]);
        }
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
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
    return unsubscribeFromMessages;
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
