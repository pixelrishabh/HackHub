require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

// Route Imports
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const teamRoutes = require('./routes/team.routes');
const mentorRoutes = require('./routes/mentor.routes');
const chatRoutes = require('./routes/chat.routes');
const ideaRoutes = require('./routes/idea.routes');
const submissionRoutes = require('./routes/submission.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const sponsorRoutes = require('./routes/sponsor.routes');
const { getEngagementDashboard } = require('./controllers/team.controller');
const { authenticate } = require('./middleware/auth.middleware');

const app = express();
const PORT = process.env.PORT || 5001;

// Security & Parsing Middleware
app.use(helmet());

// CORS configuration with explicit allow-list validation
const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5000,http://localhost:5001')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive local dev fallback
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'HackHub AI Backend (MERN)',
  });
});

const certificateRoutes = require('./routes/certificate.routes');
const hackathonRoutes = require('./routes/hackathon.routes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/sponsor', sponsorRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.get('/api/engagement/dashboard', authenticate, getEngagementDashboard);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route '${req.originalUrl}' not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[ServerError]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error occurred.',
  });
});

const User = require('./models/User');
const Profile = require('./models/Profile');
const bcrypt = require('bcryptjs');

async function autoSeedIfEmpty() {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('🌱 Database empty. Auto-seeding 5 official demo accounts...');
      const hashedPassword = await bcrypt.hash('Demo@2026!', 10);
      const demoAccounts = [
        { role: 'participant', name: 'Alex Mercer (Demo Participant)', email: 'demo.participant@hackhub.ai' },
        { role: 'mentor', name: 'Marcus Vance (Demo Mentor)', email: 'demo.mentor@hackhub.ai' },
        { role: 'judge', name: 'Dr. Sarah Chen (Demo Judge)', email: 'demo.judge@hackhub.ai' },
        { role: 'organizer', name: 'Alex Rivera (Demo Organizer)', email: 'demo.organizer@hackhub.ai' },
        { role: 'sponsor', name: 'Elena Rostova (Demo Sponsor)', email: 'demo.sponsor@hackhub.ai' },
      ];

      for (const acc of demoAccounts) {
        const u = await User.create({ name: acc.name, email: acc.email, password: hashedPassword, role: acc.role });
        await Profile.create({ userId: u._id, username: acc.email.split('@')[0] });
      }
      console.log('✅ Auto-seeded 5 official demo accounts successfully.');
    }
  } catch (e) {
    console.warn('[AutoSeed] Non-critical warning:', e.message);
  }
}

// Start Server
async function startServer() {
  await connectDB();
  await autoSeedIfEmpty();
  app.listen(PORT, () => {
    console.log('==================================================');
    console.log(`🚀 HackHub AI Backend (MERN) running on port ${PORT}`);
    console.log(`📡 Healthcheck: http://localhost:${PORT}/api/health`);
    console.log('==================================================');
  });
}

startServer();

module.exports = app;
