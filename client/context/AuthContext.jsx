import { useState, createContext, useEffect, use } from "react";
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

    //check if the user is authenticated
    const checkAuth = async () => {
        if (!token) {
            setAuthUser(null); // Clear auth state if no token
            return;
        }
        try {
            const { data } = await axios.get('/api/auth/check');
            if (data.success) {
                setAuthUser(data.userData);
                connectSocket(data.userData);
            }
        } catch (error) {
            setAuthUser(null); // Clear auth state on error
            localStorage.removeItem('token'); // Remove invalid token
            toast.error('Please log in again');
        }
    };


    //login function to handle user authentication and socket connection
    const login = async (state, credentials) => {
        try {
            console.log(`Sending ${state} request with payload:`, credentials);
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            if (data.success) {
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common['token'] = data.token;
                setToken(data.token);
                localStorage.setItem('token', data.token);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            const message = error.response?.data?.message || `Failed to ${state}`;
            console.error(`${state} error:`, error.response?.data || error.message);
            toast.error(message);
        }
    };

    //logout function to handle user logout and socket disconnection
    const logout =  async () => {
        localStorage.removeItem('token');
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common['token'] = null;
        toast.success('Logged out successfully');
        socket?.disconnect();
    }


    //update user function to handle user profile updates
    const updateProfile = async (userData) => {
        try {
            const {data} = await axios.put('/api/auth/update', userData);
            if(data.success) {
                setAuthUser(data.user);
                toast.success(data.message);
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    //connect to the socket function to handle real-time events
    const connectSocket = (userData) => {
        if(!userData || socket?.connected) return;

        const newSocket = io(backendUrl, {
            query:{
                userId: userData._id,
            }
        });
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (users) => {
            setOnlineUsers(users);
        })

        newSocket.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });

        newSocket.on('onlineUsers', (users) => {
            setOnlineUsers(users);
        });

    }
    useEffect(() => {
    if (token) {
        axios.defaults.headers.common['token'] = token;
        checkAuth();
    } else {
        setAuthUser(null); // Clear auth state if no token
    }
}, [token]);

    const value ={
        axios,
        token,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile
    }

    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

