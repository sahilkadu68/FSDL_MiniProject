import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

import authRoutes from './routes/auth.js';
import logRoutes from './routes/logs.js';
import aiRoutes from './routes/ai.js';
import authMiddleware from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/logs', authMiddleware, logRoutes);
app.use('/api/v1/ai', authMiddleware, aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong.' });
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    let mongoUri = process.env.MONGODB_URI;

    // If no real MongoDB URI or it's the placeholder, use in-memory MongoDB
    if (!mongoUri || mongoUri.includes('<username>') || mongoUri.includes('xxxxx')) {
      console.log('⏳ Starting in-memory MongoDB (no external DB needed)...');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      console.log('✅ In-memory MongoDB running');
      console.log('⚠️  Note: Data will reset when server restarts (fine for demo/presentation)');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server startup failed:', err.message);
    process.exit(1);
  }
}

startServer();
