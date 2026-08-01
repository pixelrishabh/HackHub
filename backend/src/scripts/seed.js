require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Reseeding HackHub AI Database for Demo...');

  // Clean existing tables
  try {
    if (prisma.sponsorBookmark) await prisma.sponsorBookmark.deleteMany();
    if (prisma.certificate) await prisma.certificate.deleteMany();
    await prisma.mentorMessage.deleteMany();
    await prisma.engagementEvent.deleteMany();
    await prisma.evaluation.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.team.deleteMany();
    await prisma.joinRequest.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany();
  } catch (err) {
    console.log('Notice during table clean:', err.message);
  }

  // Dual password hashes for max compatibility
  const demoPasswordHash = await bcrypt.hash('Demo@2026!', 10);
  const legacyPasswordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create EXACT 5 Judge-Friendly Demo Accounts (password: Demo@2026!)
  const demoParticipant = await prisma.user.create({
    data: {
      name: 'Alex Mercer (Demo Participant)',
      email: 'demo.participant@hackhub.ai',
      password_hash: demoPasswordHash,
      role: 'participant',
      profile: {
        create: {
          skills: JSON.stringify(['React', 'TypeScript', 'Node.js', 'Python', 'AI Agents']),
          experience_level: 'Advanced',
          interests: JSON.stringify(['AI Agents', 'Fullstack Web', 'LLMs']),
          timezone: 'UTC',
          project_goal_text: 'Build next-gen autonomous AI tools for developers.',
        },
      },
    },
    include: { profile: true },
  });

  const demoMentor = await prisma.user.create({
    data: {
      name: 'Marcus Vance (Demo Mentor)',
      email: 'demo.mentor@hackhub.ai',
      password_hash: demoPasswordHash,
      role: 'mentor',
      profile: {
        create: {
          skills: JSON.stringify(['React', 'Node.js', 'PostgreSQL', 'GraphQL', 'System Design']),
          experience_level: 'Advanced',
          interests: JSON.stringify(['Mentorship', 'Fullstack Architecture']),
          timezone: 'UTC',
          project_goal_text: 'Guide hackathon teams to production excellence.',
        },
      },
    },
    include: { profile: true },
  });

  const demoJudge = await prisma.user.create({
    data: {
      name: 'Dr. Sarah Chen (Demo Judge)',
      email: 'demo.judge@hackhub.ai',
      password_hash: demoPasswordHash,
      role: 'judge',
      profile: {
        create: {
          skills: JSON.stringify(['Machine Learning', 'System Architecture', 'Code Auditing']),
          experience_level: 'Advanced',
          interests: JSON.stringify(['AI Evaluation', 'Distributed Systems']),
          timezone: 'PST',
          project_goal_text: 'Provide rigorous and objective technical evaluation.',
        },
      },
    },
    include: { profile: true },
  });

  const demoOrganizer = await prisma.user.create({
    data: {
      name: 'Alex Rivera (Demo Organizer)',
      email: 'demo.organizer@hackhub.ai',
      password_hash: demoPasswordHash,
      role: 'organizer',
      profile: {
        create: {
          skills: JSON.stringify(['Event Operations', 'Product Strategy', 'Community']),
          experience_level: 'Advanced',
          interests: JSON.stringify(['Hackathons', 'Developer Tools']),
          timezone: 'EST',
          project_goal_text: 'Orchestrate seamlessly scaled AI hackathons.',
        },
      },
    },
    include: { profile: true },
  });

  const demoSponsor = await prisma.user.create({
    data: {
      name: 'Elena Rostova (Demo Sponsor)',
      email: 'demo.sponsor@hackhub.ai',
      password_hash: demoPasswordHash,
      role: 'sponsor',
      profile: {
        create: {
          skills: JSON.stringify(['Venture Capital', 'Talent Scouting', 'AI Investments']),
          experience_level: 'Advanced',
          interests: JSON.stringify(['Sponsorship', 'Startups']),
          timezone: 'PST',
          project_goal_text: 'Sponsor innovative developer projects and recruit top AI talent.',
        },
      },
    },
    include: { profile: true },
  });

  // 2. Create Legacy / Alias Accounts (for automated scripts & backward compatibility)
  await prisma.user.create({
    data: {
      name: 'Alex Rivera (Organizer)',
      email: 'organizer@hackops.test',
      password_hash: legacyPasswordHash,
      role: 'organizer',
      profile: { create: { skills: '["Event Operations"]', experience_level: 'Advanced' } },
    },
  });

  await prisma.user.create({
    data: {
      name: 'Dr. Sarah Chen (Judge)',
      email: 'judge@hackops.test',
      password_hash: legacyPasswordHash,
      role: 'judge',
      profile: { create: { skills: '["Machine Learning"]', experience_level: 'Advanced' } },
    },
  });

  await prisma.user.create({
    data: {
      name: 'Devon Lee',
      email: 'devon@hackops.test',
      password_hash: legacyPasswordHash,
      role: 'participant',
      profile: { create: { skills: '["Python", "FastAPI"]', experience_level: 'Advanced' } },
    },
  });

  // Additional Participants for teams
  const p2 = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'priya@hackhub.ai',
      password_hash: demoPasswordHash,
      role: 'participant',
      profile: { create: { skills: '["React", "Figma"]', experience_level: 'Intermediate' } },
    },
  });

  const p3 = await prisma.user.create({
    data: {
      name: 'Liam O\'Connor',
      email: 'liam@hackhub.ai',
      password_hash: demoPasswordHash,
      role: 'participant',
      profile: { create: { skills: '["Node.js", "Docker"]', experience_level: 'Intermediate' } },
    },
  });

  const p4 = await prisma.user.create({
    data: {
      name: 'Kenji Takahashi',
      email: 'kenji@hackhub.ai',
      password_hash: demoPasswordHash,
      role: 'participant',
      profile: { create: { skills: '["Vue.js", "WebSockets"]', experience_level: 'Beginner' } },
    },
  });

  // 3. Create Teams
  const team1 = await prisma.team.create({
    data: {
      name: 'NeuralCrafters',
      leader_id: demoParticipant.id,
      description: 'Building autonomous AI hackathon management OS.',
      primary_field: 'AI/ML',
      member_ids: JSON.stringify([demoParticipant.id, p2.id, p3.id]),
      match_rationale_text: 'Complementary skill matrix combining Alex (AI Agents), Priya (UI/UX), and Liam (Backend).',
    },
  });

  const team2 = await prisma.team.create({
    data: {
      name: 'DataPulse AI',
      leader_id: p4.id,
      description: 'Real-time vector search and RAG analytics dashboard.',
      primary_field: 'Data & Analytics',
      member_ids: JSON.stringify([p4.id]),
      match_rationale_text: 'Focused on high-performance vector retrieval and real-time streaming analytics.',
    },
  });

  // 4. Create In-Progress Submission
  const submission1 = await prisma.submission.create({
    data: {
      team_id: team1.id,
      repo_link: 'https://github.com/pixelrishabh/HackHub',
      description: 'HackHub AI is an end-to-end intelligent hackathon OS featuring skill-based team matchmaking, real-time AI mentor chat, dynamic rubric scoring, and digital certificate verification.',
      demo_video_link: 'https://youtube.com/watch?v=demo12345',
      status: 'SUBMITTED',
    },
  });

  // 5. Create AI & Manual Evaluation
  await prisma.evaluation.create({
    data: {
      submission_id: submission1.id,
      originality_score: 9.2,
      technical_depth_score: 9.5,
      completeness_score: 9.0,
      clarity_score: 9.4,
      ai_justification_text: 'Outstanding production architecture with full Gemini LLM integration, live scorecards, and high performance.',
      judge_manual_score: 9.3,
    },
  });

  // 6. Create Engagement Events
  await prisma.engagementEvent.createMany({
    data: [
      { team_id: team1.id, user_id: demoParticipant.id, event_type: 'check_in' },
      { team_id: team1.id, user_id: p2.id, event_type: 'check_in' },
      { team_id: team1.id, user_id: demoParticipant.id, event_type: 'chat_message' },
      { team_id: team1.id, user_id: p3.id, event_type: 'chat_message' },
      { team_id: team1.id, user_id: demoParticipant.id, event_type: 'submission_create' },
      { team_id: team1.id, user_id: demoParticipant.id, event_type: 'submission_update' },
    ],
  });

  // 7. Create Mentor Chat Messages
  await prisma.mentorMessage.createMany({
    data: [
      { team_id: team1.id, sender: 'user', content: 'What is the best way to structure our Gemini API calls for instant response times?' },
      { team_id: team1.id, sender: 'mentor', content: 'Use structured JSON outputs and keep system prompts concise. Also make sure to implement proper loading states and error fallbacks!' },
      { team_id: team1.id, sender: 'user', content: 'Thanks! The live scorecard and idea validator are working great now.' },
    ],
  });

  console.log('\n===============================================================');
  console.log('🎉 HACKHUB AI DEMO DATABASE RESEEDED SUCCESSFULLY!');
  console.log('===============================================================');
  console.log('Official Demo Credentials (Password for all: Demo@2026!):');
  console.log('---------------------------------------------------------------');
  console.log('1. PARTICIPANT : demo.participant@hackhub.ai  |  Demo@2026!');
  console.log('2. MENTOR      : demo.mentor@hackhub.ai       |  Demo@2026!');
  console.log('3. JUDGE       : demo.judge@hackhub.ai        |  Demo@2026!');
  console.log('4. ORGANIZER   : demo.organizer@hackhub.ai    |  Demo@2026!');
  console.log('5. SPONSOR     : demo.sponsor@hackhub.ai      |  Demo@2026!');
  console.log('===============================================================\n');
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Seeding error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = main;
