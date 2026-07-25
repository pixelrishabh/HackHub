require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding HackOps AI Database...');

  // Clean existing tables
  await prisma.mentorMessage.deleteMany();
  await prisma.engagementEvent.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.team.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Core Platform Users
  const organizer = await prisma.user.create({
    data: {
      name: 'Alex Rivera (Organizer)',
      email: 'organizer@hackops.test',
      password_hash: passwordHash,
      role: 'organizer',
      profile: {
        create: {
          skills: JSON.stringify(['Event Operations', 'Product Strategy', 'Community']),
          experience_level: 'Advanced',
          interests: JSON.stringify(['Hackathons', 'Developer Tools']),
          timezone: 'EST',
          project_goal_text: 'Organize a world-class AI hackathon.',
        },
      },
    },
  });

  const judge = await prisma.user.create({
    data: {
      name: 'Dr. Sarah Chen (Judge)',
      email: 'judge@hackops.test',
      password_hash: passwordHash,
      role: 'judge',
      profile: {
        create: {
          skills: JSON.stringify(['Machine Learning', 'System Architecture', 'Code Review']),
          experience_level: 'Advanced',
          interests: JSON.stringify(['AI Agents', 'Distributed Systems']),
          timezone: 'PST',
          project_goal_text: 'Fair evaluation of innovative projects.',
        },
      },
    },
  });

  const mentor = await prisma.user.create({
    data: {
      name: 'Marcus Vance (Mentor)',
      email: 'mentor@hackops.test',
      password_hash: passwordHash,
      role: 'mentor',
      profile: {
        create: {
          skills: JSON.stringify(['React', 'Node.js', 'PostgreSQL', 'GraphQL']),
          experience_level: 'Advanced',
          interests: JSON.stringify(['Mentorship', 'Fullstack Web']),
          timezone: 'UTC',
          project_goal_text: 'Help teams overcome technical roadblocks.',
        },
      },
    },
  });

  // 2. Create Participant Users
  const participants = [
    {
      name: 'Devon Lee',
      email: 'devon@hackops.test',
      skills: ['Python', 'FastAPI', 'PyTorch', 'LangChain'],
      experience_level: 'Advanced',
      interests: ['AI Agents', 'LLMs'],
      project_goal_text: 'Build autonomous coding assistants.',
    },
    {
      name: 'Priya Sharma',
      email: 'priya@hackops.test',
      skills: ['React', 'TypeScript', 'TailwindCSS', 'Figma'],
      experience_level: 'Intermediate',
      interests: ['UI/UX', 'Frontend Performance'],
      project_goal_text: 'Design slick, modern developer interfaces.',
    },
    {
      name: 'Liam O\'Connor',
      email: 'liam@hackops.test',
      skills: ['Node.js', 'PostgreSQL', 'Docker', 'Redis'],
      experience_level: 'Intermediate',
      interests: ['Backend Architecture', 'Database Optimization'],
      project_goal_text: 'Build scaleable hackathon infrastructure.',
    },
    {
      name: 'Elena Rostova',
      email: 'elena@hackops.test',
      skills: ['Python', 'Transformers', 'Vector Databases', 'OpenAI API'],
      experience_level: 'Advanced',
      interests: ['Semantic Search', 'RAG'],
      project_goal_text: 'Create intelligent vector retrieval engines.',
    },
    {
      name: 'Kenji Takahashi',
      email: 'kenji@hackops.test',
      skills: ['Vue.js', 'CSS Glassmorphism', 'UI Design', 'WebSockets'],
      experience_level: 'Beginner',
      interests: ['Realtime Dashboards', 'Web Apps'],
      project_goal_text: 'Learn AI integration with web applications.',
    },
    {
      name: 'Sophia Martinez',
      email: 'sophia@hackops.test',
      skills: ['Go', 'Kubernetes', 'gRPC', 'PostgreSQL'],
      experience_level: 'Advanced',
      interests: ['Cloud Native', 'DevOps'],
      project_goal_text: 'Build resilient cloud backends.',
    },
  ];


  const createdParticipants = [];
  for (const p of participants) {
    const user = await prisma.user.create({
      data: {
        name: p.name,
        email: p.email,
        password_hash: passwordHash,
        role: 'participant',
        profile: {
          create: {
            skills: JSON.stringify(p.skills),
            experience_level: p.experience_level,
            interests: JSON.stringify(p.interests),
            timezone: 'UTC',
            project_goal_text: p.project_goal_text,
          },
        },
      },
      include: { profile: true },
    });
    createdParticipants.push(user);
  }

  // 3. Create Sample Teams
  const team1 = await prisma.team.create({
    data: {
      name: 'NeuralCrafters',
      member_ids: JSON.stringify([createdParticipants[0].id, createdParticipants[1].id, createdParticipants[2].id]),
      match_rationale_text: 'Matched based on complementary skill set combining Devon (PyTorch AI), Priya (React UI), and Liam (Node.js backend).',
    },
  });

  const team2 = await prisma.team.create({
    data: {
      name: 'DataPulse AI',
      member_ids: JSON.stringify([createdParticipants[3].id, createdParticipants[4].id, createdParticipants[5].id]),
      match_rationale_text: 'Matched combining Elena (RAG & Vector DBs), Kenji (Vue UI), and Sophia (Go infrastructure).',
    },
  });

  // 4. Create Sample Submissions (including similar descriptions for similarity test)
  const submission1 = await prisma.submission.create({
    data: {
      team_id: team1.id,
      repo_link: 'https://github.com/neuralcrafters/hackops-agent',
      description: 'HackOps AI is an intelligent autonomous hackathon manager platform. It uses Gemini LLM APIs to automate skill-based team formation, live AI mentor support with repo context, automated rubric evaluation, and real-time engagement scoring.',
      demo_video_link: 'https://youtube.com/watch?v=demo12345',
      status: 'SUBMITTED',
    },
  });

  const submission2 = await prisma.submission.create({
    data: {
      team_id: team2.id,
      repo_link: 'https://github.com/datapulse/hackathon-ai-manager',
      description: 'HackOps AI is an intelligent autonomous hackathon manager platform. It uses Gemini LLM APIs to automate skill-based team formation, live AI mentor support with repo context, automated rubric evaluation, and real-time engagement scoring.', // Intentionally similar description to trigger similarity detector flag!
      demo_video_link: 'https://youtube.com/watch?v=demo67890',
      status: 'SUBMITTED',
    },
  });

  // 5. Create Sample Evaluations
  await prisma.evaluation.create({
    data: {
      submission_id: submission1.id,
      originality_score: 9.0,
      technical_depth_score: 9.5,
      completeness_score: 8.5,
      clarity_score: 9.0,
      ai_justification_text: 'Exceptional architectural execution leveraging multi-modal LLM APIs and real-time event aggregation.',
      judge_manual_score: 9.2,
    },
  });

  // 6. Create Engagement Events
  await prisma.engagementEvent.createMany({
    data: [
      { team_id: team1.id, user_id: createdParticipants[0].id, event_type: 'check_in' },
      { team_id: team1.id, user_id: createdParticipants[1].id, event_type: 'check_in' },
      { team_id: team1.id, user_id: createdParticipants[0].id, event_type: 'chat_message' },
      { team_id: team1.id, user_id: createdParticipants[2].id, event_type: 'chat_message' },
      { team_id: team1.id, user_id: createdParticipants[0].id, event_type: 'submission_create' },
      { team_id: team1.id, user_id: createdParticipants[1].id, event_type: 'submission_update' },
      { team_id: team2.id, user_id: createdParticipants[3].id, event_type: 'check_in' },
      { team_id: team2.id, user_id: createdParticipants[3].id, event_type: 'chat_message' },
    ],
  });

  // 7. Create Sample Mentor Messages
  await prisma.mentorMessage.createMany({
    data: [
      { team_id: team1.id, sender: 'user', content: 'How do we handle odd numbers of participants in team matchmaking?' },
      { team_id: team1.id, sender: 'mentor', content: 'The AI Team Formation endpoint automatically creates flexible teams of 2 to 4 members so every participant is matched!' },
    ],
  });

  console.log('✅ Seeding completed successfully!');
  console.log(`Created:`);
  console.log(`- 1 Organizer (organizer@hackops.ai / Password123!)`);
  console.log(`- 1 Judge (judge@hackops.ai / Password123!)`);
  console.log(`- 1 Mentor (mentor@hackops.ai / Password123!)`);
  console.log(`- ${createdParticipants.length} Participants`);
  console.log(`- 2 Teams (NeuralCrafters, DataPulse AI)`);
  console.log(`- 2 Submissions & Evaluations`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
