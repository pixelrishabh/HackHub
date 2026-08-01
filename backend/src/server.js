require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const teamRoutes = require('./routes/team.routes');
const mentorRoutes = require('./routes/mentor.routes');
const submissionRoutes = require('./routes/submission.routes');
const ideaRoutes = require('./routes/idea.routes');
const engagementRoutes = require('./routes/engagement.routes');
const notificationRoutes = require('./routes/notification.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const chatRoutes = require('./routes/chat.routes');
const sponsorRoutes = require('./routes/sponsor.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable reverse proxy support for Render/Vercel
app.set('trust proxy', 1);

// Security HTTP Headers
app.use(helmet());

// Explicit CORS Allow-List
const rawOrigins = process.env.ALLOWED_ORIGIN || 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5000,http://127.0.0.1:5500,http://localhost:8080,http://127.0.0.1:8080';
const allowedOrigins = rawOrigins.split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'HackHub Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/engagement', engagementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/sponsor', sponsorRoutes);

// Global Error Handler (stateless API server, no error details leaked)
app.use((err, req, res, next) => {
  console.error('[HackHub Server Error]:', err);
  res.status(err.status || 500).json({
    error: 'An internal server error occurred.',
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

const prisma = require('./config/db');

async function autoSeedIfEmpty() {
  try {
    const userCount = await prisma.user.count();
    const hasDemoUser = await prisma.user.findFirst({ where: { email: 'demo.participant@hackhub.ai' } });
    if (userCount === 0 || !hasDemoUser) {
      console.log('🌱 Reseeding database with official 5 demo accounts...');
      const seedFn = require('./scripts/seed');
      if (typeof seedFn === 'function') {
        await seedFn();
      }
    }
  } catch (err) {
    console.error('[AutoSeed] Error during initial database check:', err.message);
  }
}

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    console.log(`==================================================`);
    console.log(`🚀 HackHub Backend running on port ${PORT}`);
    console.log(`📡 Healthcheck: http://localhost:${PORT}/api/health`);
    console.log(`==================================================`);
    await autoSeedIfEmpty();
  });
}

module.exports = app;

