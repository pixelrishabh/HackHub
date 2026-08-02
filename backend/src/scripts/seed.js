require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Team = require('../models/Team');
const Submission = require('../models/Submission');
const MentorMessage = require('../models/MentorMessage');
const ChatMessage = require('../models/ChatMessage');
const EngagementEvent = require('../models/EngagementEvent');

const DEMO_PASSWORD = 'Demo@2026!';

const DEMO_ACCOUNTS = [
  {
    role: 'participant',
    name: 'Alex Mercer (Demo Participant)',
    email: 'demo.participant@hackhub.ai',
    profile: {
      username: 'alex_mercer_ai',
      bio: 'Senior AI Systems Engineer & Hackathon Competitor.',
      skills: ['React', 'Node.js', 'PyTorch', 'Groq AI', 'TailwindCSS'],
      experienceLevel: 'Advanced',
      projectGoalText: 'Build next-gen autonomous AI tools for developers.',
      timezone: 'UTC',
      githubUrl: 'https://github.com/alexmercer',
      linkedinUrl: 'https://linkedin.com/in/alexmercer',
      theme: 'deep-black-diamond',
      accentColor: '#00E5FF',
      checkInStreak: 5,
      checkInCount: 14,
      badges: ['First Step', 'Streak Master', 'Hackathon Veteran'],
    },
  },
  {
    role: 'mentor',
    name: 'Marcus Vance (Demo Mentor)',
    email: 'demo.mentor@hackhub.ai',
    profile: {
      username: 'marcus_vance_tech',
      bio: 'Principal AI Architect & Technical Hackathon Mentor.',
      skills: ['AI Architecture', 'LLMs', 'FastAPI', 'PyTorch', 'System Design'],
      experienceLevel: 'Expert',
      timezone: 'UTC',
      githubUrl: 'https://github.com/marcusvance',
      theme: 'deep-black-diamond',
      accentColor: '#00E5FF',
      checkInStreak: 8,
      checkInCount: 22,
    },
  },
  {
    role: 'judge',
    name: 'Dr. Sarah Chen (Demo Judge)',
    email: 'demo.judge@hackhub.ai',
    profile: {
      username: 'dr_sarah_chen',
      bio: 'VP of AI Research & Hackathon Scoring Judge.',
      skills: ['Rubric Evaluation', 'System Audits', 'AI Ethics', 'Pitch Scoring'],
      experienceLevel: 'Expert',
      timezone: 'UTC',
      theme: 'deep-black-diamond',
      accentColor: '#00E5FF',
      checkInStreak: 12,
      checkInCount: 30,
    },
  },
  {
    role: 'organizer',
    name: 'Alex Rivera (Demo Organizer)',
    email: 'demo.organizer@hackhub.ai',
    profile: {
      username: 'alex_rivera_ops',
      bio: 'Lead Hackathon Director & Platform Administrator.',
      skills: ['Event Management', 'Platform Operations', 'Community Growth'],
      experienceLevel: 'Expert',
      timezone: 'UTC',
      theme: 'deep-black-diamond',
      accentColor: '#00E5FF',
      checkInStreak: 15,
      checkInCount: 45,
    },
  },
  {
    role: 'sponsor',
    name: 'Elena Rostova (Demo Sponsor)',
    email: 'demo.sponsor@hackhub.ai',
    profile: {
      username: 'elena_rostova_vc',
      bio: 'Lead Sponsor & AI Track Partner.',
      skills: ['Venture Capital', 'Sponsor Tracks', 'Grant Funding'],
      experienceLevel: 'Executive',
      timezone: 'UTC',
      theme: 'deep-black-diamond',
      accentColor: '#00E5FF',
      checkInStreak: 4,
      checkInCount: 10,
    },
  },
];

async function seed() {
  console.log('🌱 Reseeding HackHub AI MongoDB Database for Demo...');
  await connectDB();

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Profile.deleteMany({}),
    Team.deleteMany({}),
    Submission.deleteMany({}),
    MentorMessage.deleteMany({}),
    ChatMessage.deleteMany({}),
    EngagementEvent.deleteMany({}),
  ]);

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
  const createdUsers = {};

  for (const acc of DEMO_ACCOUNTS) {
    const user = await User.create({
      name: acc.name,
      email: acc.email,
      password: hashedPassword,
      role: acc.role,
    });

    await Profile.create({
      userId: user._id,
      ...acc.profile,
    });

    createdUsers[acc.role] = user;
  }

  const participant = createdUsers['participant'];
  const mentor = createdUsers['mentor'];

  // Seed Teams
  const team1 = await Team.create({
    name: 'NeuralCrafters',
    leaderId: participant._id,
    members: [participant._id, mentor._id],
    category: 'AI / Machine Learning',
    primaryField: 'AI/ML',
    description: 'Autonomous AI hackathon management platform with Groq LLM & RAG.',
    requiredSkills: ['React', 'Node.js', 'PyTorch', 'LLMs'],
    techStack: ['React', 'Groq AI', 'Express', 'MongoDB', 'TailwindCSS'],
    matchRationaleText: 'Complementary skill matrix combining AI agents, fullstack architecture, and real-time state management.',
  });

  const team2 = await Team.create({
    name: 'DataPulse AI',
    leaderId: createdUsers['judge']._id,
    members: [createdUsers['judge']._id],
    category: 'Data & Analytics',
    primaryField: 'Data & Analytics',
    description: 'Real-time telemetry and similarity scoring for hackathons.',
    requiredSkills: ['Python', 'FastAPI', 'MongoDB'],
    techStack: ['Python', 'FastAPI', 'React'],
  });

  // Seed Submission
  await Submission.create({
    teamId: team1._id,
    title: 'HackHub AI Autonomous OS',
    description: 'Autonomous AI hackathon management platform with real-time scoring, Groq AI mentor, and submission similarity detection.',
    repoLink: 'https://github.com/neuralcrafters/hackops-agent',
    demoVideoLink: 'https://youtube.com/watch?v=demo',
    status: 'SUBMITTED',
    aiEvaluation: {
      overall_score: 9.1,
      originality_score: 9.3,
      technical_depth_score: 9.0,
      completeness_score: 8.8,
      clarity_score: 9.3,
      justification: 'Outstanding hackathon submission with strong AI agent architecture, instant response latency, and cohesive glassmorphism UI design.',
      evaluator_role: 'AI Judge Engine',
      evaluated_at: new Date(),
    },
    judgeManualScore: 9.2,
  });

  // Seed Mentor Chat History
  await MentorMessage.create({
    teamId: team1._id.toString(),
    sender: 'user',
    content: 'How can we optimize our Groq LLM prompt for sub-500ms latency?',
    mode: 'developer',
  });

  await MentorMessage.create({
    teamId: team1._id.toString(),
    sender: 'mentor',
    content: 'Keep max_tokens to 1024, pass a focused system prompt, and use model llama-3.3-70b-versatile for ultra-fast completions!',
    mode: 'developer',
  });

  // Seed Direct Chat
  await ChatMessage.create({
    senderId: participant._id,
    targetId: mentor._id,
    message: 'Hey Marcus! Thanks for the mentor feedback on our architecture diagram.',
  });

  // Seed Engagement Events
  await EngagementEvent.create({ teamId: team1._id.toString(), userId: participant._id, eventType: 'check_in' });
  await EngagementEvent.create({ teamId: team1._id.toString(), userId: participant._id, eventType: 'chat_message' });
  await EngagementEvent.create({ teamId: team1._id.toString(), userId: participant._id, eventType: 'submission_create' });

  console.log('===============================================================');
  console.log('🎉 HACKHUB AI DEMO DATABASE RESEEDED SUCCESSFULLY!');
  console.log('===============================================================');
  console.log('Official Demo Credentials (Password for all: Demo@2026!):');
  console.log('---------------------------------------------------------------');
  console.log('1. PARTICIPANT : demo.participant@hackhub.ai  |  Demo@2026!');
  console.log('2. MENTOR      : demo.mentor@hackhub.ai       |  Demo@2026!');
  console.log('3. JUDGE       : demo.judge@hackhub.ai        |  Demo@2026!');
  console.log('4. ORGANIZER   : demo.organizer@hackhub.ai    |  Demo@2026!');
  console.log('5. SPONSOR     : demo.sponsor@hackhub.ai      |  Demo@2026!');
  console.log('===============================================================');

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding Failed:', err);
  process.exit(1);
});
