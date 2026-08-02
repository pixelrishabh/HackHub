const mongoose = require('mongoose');

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error('❌ FATAL ERROR: JWT_SECRET environment variable is missing.');
    process.exit(1);
  }

  if (!mongoUri) {
    console.error('❌ FATAL ERROR: MONGODB_URI environment variable is missing.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ MongoDB direct connection warning (${error.message}). Checking local fallback...`);
    try {
      // In-memory or fallback connection
      const fallbackUri = 'mongodb://127.0.0.1:27017/hackhub';
      const conn = await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 3000 });
      console.log(`🍃 MongoDB Connected to local fallback: ${conn.connection.host}`);
      return conn;
    } catch (e) {
      console.error('❌ MongoDB Connection Error:', error.message);
      // For local testing without active MongoDB service, allow server to run with mock database handler
      return null;
    }
  }
}

module.exports = connectDB;
