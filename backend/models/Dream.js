// models/Dream.js
import mongoose from 'mongoose';

const dreamSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  theme: { type: String, required: true },
  style: { type: String, required: true },
  imageUrl: { type: String, required: true },
  deviceId: { type: String, required: true }, // 👈 必须加上这一行！
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Dream', dreamSchema);