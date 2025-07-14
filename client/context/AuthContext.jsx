import { useState, createContext, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(null);
  const [socket, setSocket] = useState(null);

  // ✅ On first load, ensure axios has token
  useEffect(() => {
    const localToken = localStorage.getItem('token');
    if (localToken) {
      axios.defaults.headers.common['token'] = localToken;
      setToken(localToken); // ensure state sync
    }
  }, []);

  // Centralized token and header sync
  const setTokenAndHeader = (newToken) => {
    setToken(newToken);
    if (newToken) {
      axios.defaults.headers.common['token'] = newToken;
      localStorage.setItem('token', newToken);
    } else {
      delete axios.defaults.headers.common['token'];
      localStorage.removeItem('token');
    }
  };

  // check if the user is authenticated
  const checkAuth = async () => {
    if (!token) {
      setAuthUser(null);
      return;
    }

    try {
      const { data } = await axios.get('/api/auth/check');
      console.log("Auth check success:", data);
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      console.log("Auth check failed:", error.response?.data || error.message);
      setAuthUser(null);
      setTokenAndHeader(null);
      toast.error('Please log in again');
    }
  };

  // login function
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.user);
        setTokenAndHeader(data.token);
        connectSocket(data.user);
        toast.success(data.message);
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${state}`);
      return false;
    }
  };

  // logout function
  const logout = async () => {
    setTokenAndHeader(null);
    setAuthUser(null);
    setOnlineUsers([]);
    toast.success('Logged out successfully');
    socket?.disconnect();
  };

  // update user profile
  const updateProfile = async (userData) => {
    try {
      const { data } = await axios.put('/api/auth/update-profile', userData);
      if (data.success) {
        setAuthUser(data.user);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // socket connection
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;

    const newSocket = io(backendUrl, {
      query: {
        userId: userData._id,
      },
    });

    newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    newSocket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });
  };

  // ✅ Auto-check auth when token is set
  useEffect(() => {
    if (token) {
      checkAuth();
    } else {
      setAuthUser(null);
    }
  }, [token]);

  const value = {
    axios,
    token,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
