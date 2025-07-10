import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import "dotenv/config";
import http from "http";
import { connectDB } from './lib/db.js';

//create express app
const app = express();
const server = http.createServer(app);

//middlewares
app.use(cors());
app.use(express.json({ limit: '4mb' }));

app.use("/api/status", (req, res) => {
  res.send("Server is running");
});

//connect to mongodb
await connectDB();
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

