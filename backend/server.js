import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 连接 MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB 已连接"))
  .catch((err) => console.error(err));

// 路由
import apiRoutes from './routes/api.js'; // 注意：ESM 需要 .js 后缀
app.use('/api', apiRoutes);

import dreamRoutes from "./routes/dream.js";
app.use("/api/dream", dreamRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`后端已运行在端口 ${PORT}`));
