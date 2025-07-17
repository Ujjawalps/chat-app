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
  const [loadingAuth, setLoadingAuth] = useState(true);


  useEffect(() => {
    const localToken = localStorage.getItem('token');
    if (localToken) {
      axios.defaults.headers.common['token'] = localToken;
      setToken(localToken);
    }
  }, []);

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

  const checkAuth = async () => {
    setLoadingAuth(true); // Start loading

    if (!token) {
      setAuthUser(null);
      setLoadingAuth(false);
      return;
    }

    try {
      const { data } = await axios.get('/api/auth/check');
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      } else {
        setAuthUser(null);
        setTokenAndHeader(null);
      }
    } catch (error) {
      setAuthUser(null);
      setTokenAndHeader(null);
      toast.error('Please log in again');
    } finally {
      setLoadingAuth(false); // Done loading
    }
  };


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

  const logout = async () => {
    setTokenAndHeader(null);
    setAuthUser(null);
    setOnlineUsers([]);
    toast.success('Logged out successfully');
    socket?.disconnect();
  };

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

  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;

    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
    });

    newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", setOnlineUsers);
    newSocket.on("onlineUsers", setOnlineUsers);
    newSocket.on("disconnect", () => setOnlineUsers([]));
  };

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
  updateProfile,
  loadingAuth,
};


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
