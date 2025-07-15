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

      console.log("🔄 getUsers() Response:", data);

      if (data.success) {
        setUsers(data.users);

        const unseenMap = {};

        data.users.forEach((user) => {
          unseenMap[user._id] = data.unseenMessagesCount?.[user._id] || 0;
        });

        console.log("📦 unseenMessages map:", unseenMap);
        setUnseenMessages(unseenMap);
      }
    } catch (error) {
      console.error("❌ Failed to load users", error);
    }
  };


  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);

        // ✅ Mark all unseen messages from this user as seen
        await axios.put(`/api/messages/mark-all/${userId}`);

        // ✅ Update state so sidebar resets unseen badge to 0
        setUnseenMessages((prev) => ({
          ...prev,
          [userId]: 0,
        }));
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
      }else if (newMessage.recieverId === authUser._id) {
        // This means it's an unseen incoming message to me
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
