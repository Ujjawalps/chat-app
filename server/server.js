import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import http from 'http';
import { connectDB } from './lib/db.js';
import UserRouter from './routes/userRouter.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'], credentials: true },
});

export const userSocketMap = {};

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  console.log(`User connected: ${userId}`);
  if (userId) {
    userSocketMap[userId] = socket.id;
  }
  io.emit('getOnlineUsers', Object.keys(userSocketMap)); // Keep for backward compatibility
  io.emit('onlineUsers', Object.keys(userSocketMap)); // Add to match client
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${userId}`);
    delete userSocketMap[userId];
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
    io.emit('onlineUsers', Object.keys(userSocketMap));
  });
});

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '4mb' }));

app.use('/api/status', (req, res) => {
  res.send('Server is running');
});
app.use('/api/auth', UserRouter);
app.use('/api/messages', messageRouter);

// Global error-handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Server error' });
});

connectDB().catch((error) => {
  console.error('Failed to start server due to database error:', error);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});