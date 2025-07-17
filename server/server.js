import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import http from 'http';
import { connectDB } from './lib/db.js';
import UserRouter from './routes/userRouter.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';
import otpRoutes from './routes/otpRoutes.js';

const app = express();
const server = http.createServer(app);

// ✅ Allow both localhost and Vercel frontend
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL
];
// ✅ Apply CORS for Express
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ✅ Socket.IO CORS setup
export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

export const userSocketMap = {};

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit('getOnlineUsers', Object.keys(userSocketMap));
  io.emit('onlineUsers', Object.keys(userSocketMap));

  socket.on('disconnect', () => {
    delete userSocketMap[userId];
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
    io.emit('onlineUsers', Object.keys(userSocketMap));
  });
});

app.use(express.json({ limit: '4mb' }));

// ✅ Health Check
app.use('/api/status', (req, res) => res.send('Server is running'));

// ✅ Routes
app.use('/api/auth', UserRouter);
app.use('/api/messages', messageRouter);
app.use('/api/otp', otpRoutes);

// ✅ Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server error' });
});

// ✅ Connect DB & Start Server
connectDB().catch((err) => {
  console.error('DB connection error:', err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
