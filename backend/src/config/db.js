const mongoose = require('mongoose');
const dns = require('dns');

// Automatically set reliable public DNS for Node.js SRV resolution on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore if custom DNS assignment is restricted by environment
}

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
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`🍃 MongoDB Atlas Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ MongoDB Atlas Connection Error (${error.message}). Checking local fallback...`);
    try {
      const fallbackUri = 'mongodb://127.0.0.1:27017/hackhub';
      const conn = await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 3000 });
      console.log(`🍃 MongoDB Connected to local fallback: ${conn.connection.host}`);
      return conn;
    } catch (e) {
      console.error('❌ Local MongoDB Fallback Connection Error:', e.message);
      return null;
    }
  }
}

module.exports = connectDB;
