import express from 'express';
import cors from 'cors';
import "dotenv/config";
import http from "http";
import { connectDB } from './lib/db.js';
import UserRouter from './routes/userRouter.js';



//create express app
const app = express();
const server = http.createServer(app);

//middlewares
app.use(cors());
app.use(express.json({ limit: '4mb' }));

//routes setup
app.use("/api/status", (req, res) => {
  res.send("Server is running");
});
app.use("/api/auth", UserRouter);

//connect to mongodb
await connectDB();
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

