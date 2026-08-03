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
const Hackathon = require('../models/Hackathon');

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
    Hackathon.deleteMany({}),
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

  // Seed Devfolio/Unstop Style Hackathons (Block 9)
  await Hackathon.create([
    {
      title: 'HackHub Global AI Summit 2026',
      slug: 'hackhub-global-ai-summit-2026',
      tagline: 'Build autonomous AI agents, LLM toolchains, and intelligent workflows.',
      description: 'Join over 2,500 developers worldwide in the premier global AI hackathon. Compete across AI/ML, Autonomous Agents, and Generative UI tracks.',
      bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      status: 'Live',
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-08-05'),
      prizePool: '$75,000 in Cash & Cloud Credits',
      location: 'Virtual / Global Online',
      tracks: ['AI/ML', 'Autonomous Agents', 'Data Science'],
      sponsors: [
        { name: 'Groq', logo: '⚡' },
        { name: 'Google Cloud', logo: '☁️' },
        { name: 'MongoDB', logo: '🍃' },
      ],
      schedule: [
        { time: 'Day 1 - 09:00 AM', event: 'Opening Ceremony & Track Briefing' },
        { time: 'Day 2 - 02:00 PM', event: 'AI Mentor Office Hours' },
        { time: 'Day 4 - 11:59 PM', event: 'Final Code & Video Submission Deadline' },
        { time: 'Day 5 - 04:00 PM', event: 'Live Judging & Winners Ceremony' },
      ],
      prizes: [
        { title: '1st Place Grand Champion', reward: '$30,000 Cash + $10k Groq Credits', description: 'Overall top performing submission evaluated by AI & judges.' },
        { title: '2nd Place Runner-Up', reward: '$15,000 Cash', description: 'Exceptional technical depth and user design.' },
        { title: 'Best Autonomous AI Agent', reward: '$10,000 Track Prize', description: 'Highest score in agentic workflow execution.' },
      ],
      registeredUserIds: [participant._id],
      featured: true,
    },
    {
      title: 'Web3 & Decentralized Future 2026',
      slug: 'web3-decentralized-future-2026',
      tagline: 'Decentralized identity, smart contracts, and zero-knowledge privacy.',
      description: 'A 48-hour intensive hackathon empowering developers to build open, censorship-resistant protocols.',
      bannerUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
      status: 'Upcoming',
      startDate: new Date('2026-08-15'),
      endDate: new Date('2026-08-18'),
      prizePool: '$50,000 in USDC',
      location: 'Hybrid / San Francisco, CA',
      tracks: ['Web3', 'Security', 'FinTech'],
      sponsors: [
        { name: 'Ethereum Foundation', logo: '🔷' },
        { name: 'Polygon', logo: '💜' },
      ],
      schedule: [
        { time: 'Aug 15 - 10:00 AM', event: 'Hacking Begins & Team Formation' },
        { time: 'Aug 17 - 05:00 PM', event: 'Submissions Close' },
      ],
      prizes: [
        { title: 'Grand Winner', reward: '$25,000 USDC', description: 'Best overall Web3 application.' },
      ],
      registeredUserIds: [],
      featured: true,
    },
    {
      title: 'FinTech Innovation Challenge 2026',
      slug: 'fintech-innovation-challenge-2026',
      tagline: 'Next-gen algorithmic trading, micro-payments, and fraud prevention.',
      description: 'Reimagine financial systems using high-speed analytics and AI-assisted fraud detection models.',
      bannerUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
      status: 'Live',
      startDate: new Date('2026-08-02'),
      endDate: new Date('2026-08-07'),
      prizePool: '$40,000 Prize Pool',
      location: 'Virtual',
      tracks: ['FinTech', 'AI/ML', 'CyberSecurity'],
      sponsors: [
        { name: 'Stripe', logo: '💳' },
        { name: 'Plaid', logo: '📊' },
      ],
      schedule: [
        { time: 'Day 1', event: 'API Keys Release & Kickoff' },
        { time: 'Day 5', event: 'Submissions & Pitch Reviews' },
      ],
      prizes: [
        { title: '1st Place FinTech', reward: '$20,000', description: 'Top financial product innovation.' },
      ],
      registeredUserIds: [participant._id],
      featured: false,
    },
    {
      title: 'CyberGuard Shield Hackathon 2025',
      slug: 'cyberguard-shield-hackathon-2025',
      tagline: 'Zero-day vulnerability scanning, automated patch management, and threat intelligence.',
      description: 'Completed annual cybersecurity sprint focused on proactive defense and AI automated penetration audit tools.',
      bannerUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
      status: 'Ended',
      startDate: new Date('2025-11-10'),
      endDate: new Date('2025-11-13'),
      prizePool: '$30,000 Awarded',
      location: 'Austin, TX',
      tracks: ['CyberSecurity', 'AI/ML'],
      winningTeams: [
        { rank: 1, teamName: 'Aegis Security Lab', projectTitle: 'AegisShield AI Audit', track: 'CyberSecurity', prize: '$15,000' },
        { rank: 2, teamName: 'ZeroTrust Zeroes', projectTitle: 'Sentinel Zero-Day Detector', track: 'AI/ML', prize: '$10,000' },
        { rank: 3, teamName: 'NetDefenders', projectTitle: 'PacketWatch Realtime Monitor', track: 'CyberSecurity', prize: '$5,000' },
      ],
      registeredUserIds: [],
      featured: false,
    },
    {
      title: 'HealthTech & BioAI Open 2025',
      slug: 'healthtech-bioai-open-2025',
      tagline: 'Diagnostic AI models, patient record privacy, and telemedicine portals.',
      description: 'Global health tech hackathon resulting in 85 open-source medical diagnostics projects.',
      bannerUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
      status: 'Ended',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2025-09-04'),
      prizePool: '$60,000 Awarded',
      location: 'Boston, MA & Virtual',
      tracks: ['Data Science', 'AI/ML'],
      winningTeams: [
        { rank: 1, teamName: 'BioScan AI', projectTitle: 'Retinal Scanner AI', track: 'AI/ML', prize: '$30,000' },
        { rank: 2, teamName: 'MedPulse', projectTitle: 'EHR Fast Analytics', track: 'Data Science', prize: '$20,000' },
      ],
      registeredUserIds: [],
      featured: false,
    },
  ]);

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
