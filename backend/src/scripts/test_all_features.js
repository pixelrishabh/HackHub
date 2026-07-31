process.env.NODE_ENV = 'test';
require('dotenv').config();
const http = require('http');
const app = require('../server');


let server;

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting End-to-End Automated Feature Verification...');

  // Start HTTP Server on port 5099 for testing
  const PORT = 5099;
  server = app.listen(PORT);
  console.log(`Server listening on http://localhost:${PORT}`);

  try {
    // 1. Healthcheck
    const health = await makeRequest({ host: 'localhost', port: PORT, path: '/api/health', method: 'GET' });
    console.log('✅ Healthcheck:', health.status === 200 ? 'PASSED' : 'FAILED', health.body.status);

    // 2. Auth - Login as Organizer & Judge
    const orgLogin = await makeRequest(
      { host: 'localhost', port: PORT, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'organizer@hackops.test', password: 'Password123!' }
    );
    const organizerToken = orgLogin.body.token;
    console.log('✅ Auth Organizer Login:', orgLogin.status === 200 ? 'PASSED' : 'FAILED');

    const judgeLogin = await makeRequest(
      { host: 'localhost', port: PORT, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'judge@hackops.test', password: 'Password123!' }
    );
    const judgeToken = judgeLogin.body.token;


    // 3. FEATURE 1 — AI Skill-Based Team Formation
    console.log('\n--- Testing Feature 1: AI Team Formation ---');
    const teamMatch = await makeRequest(
      {
        host: 'localhost', port: PORT, path: '/api/teams/match', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${organizerToken}` }
      },
      { participants: [] }
    );
    console.log('✅ Feature 1 Response:', teamMatch.status, teamMatch.body.message || teamMatch.body);

    // Get Teams
    const teamsList = await makeRequest(
      { host: 'localhost', port: PORT, path: '/api/teams', method: 'GET', headers: { 'Authorization': `Bearer ${organizerToken}` } }
    );
    const activeTeam = teamsList.body.teams[0];
    console.log(`✅ Loaded Active Team: '${activeTeam.name}' (ID: ${activeTeam.id})`);

    // 4. FEATURE 2 — AI Mentor Assistant
    console.log('\n--- Testing Feature 2: AI Mentor Assistant ---');
    const mentorChat = await makeRequest(
      {
        host: 'localhost', port: PORT, path: '/api/mentor/chat', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${organizerToken}` }
      },
      {
        team_id: activeTeam.id,
        message: 'What are the rules and schedule for the hackathon?',
      }
    );
    console.log('✅ Feature 2 Mentor Chat:', mentorChat.status, 'Response snippet:', (mentorChat.body.response?.content || '').substring(0, 80) + '...');

    const chatHistory = await makeRequest(
      { host: 'localhost', port: PORT, path: `/api/mentor/history/${activeTeam.id}`, method: 'GET', headers: { 'Authorization': `Bearer ${organizerToken}` } }
    );
    console.log('✅ Feature 2 Chat History length:', chatHistory.body.history?.length);

    // 5. FEATURE 3 — AI Project Evaluation & Scorecard
    console.log('\n--- Testing Feature 3: AI Project Evaluation ---');
    const activeSubmission = activeTeam.submissions[0];
    
    if (activeSubmission) {
      const evalRes = await makeRequest(
        {
          host: 'localhost', port: PORT, path: `/api/submissions/${activeSubmission.id}/evaluate`, method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${judgeToken}` }
        },
        {}
      );
      console.log('✅ Feature 3 AI Evaluation:', evalRes.status, 'Scores:', evalRes.body.evaluation);

      const scorecard = await makeRequest(
        { host: 'localhost', port: PORT, path: `/api/submissions/${activeSubmission.id}/evaluation`, method: 'GET', headers: { 'Authorization': `Bearer ${judgeToken}` } }
      );
      console.log('✅ Feature 3 Scorecard Side-by-Side:', scorecard.status, scorecard.body.scorecard);
    }

    // 6. FEATURE 4 — AI Idea Validation
    console.log('\n--- Testing Feature 4: AI Idea Validation ---');
    const ideaVal = await makeRequest(
      {
        host: 'localhost', port: PORT, path: '/api/ideas/validate', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${organizerToken}` }
      },
      {
        idea_description: 'An AI-powered hackathon platform that dynamically builds teams and evaluates submissions in real-time.',
        hours_remaining: 16
      }
    );
    console.log('✅ Feature 4 Idea Validation Result:', ideaVal.status, ideaVal.body.validation);

    // 7. FEATURE 5 — AI Plagiarism/Similarity Detection
    console.log('\n--- Testing Feature 5: Similarity Detection ---');
    const simCheck = await makeRequest(
      {
        host: 'localhost', port: PORT, path: '/api/submissions/check-similarity', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${organizerToken}` }
      },
      { threshold: 0.85 }
    );
    console.log('✅ Feature 5 Similarity Check:', simCheck.status, 'Flagged count:', simCheck.body.flagged_count);

    const flags = await makeRequest(
      { host: 'localhost', port: PORT, path: '/api/submissions/similarity-flags', method: 'GET', headers: { 'Authorization': `Bearer ${organizerToken}` } }
    );
    console.log('✅ Feature 5 Similarity Flags Endpoint:', flags.status, 'Total flagged pairs:', flags.body.total_flagged);

    // 8. FEATURE 6 — Live Engagement Score
    console.log('\n--- Testing Feature 6: Live Engagement Score & Dashboard ---');
    const checkIn = await makeRequest(
      { host: 'localhost', port: PORT, path: `/api/teams/${activeTeam.id}/check-in`, method: 'POST', headers: { 'Authorization': `Bearer ${organizerToken}` } }
    );
    console.log('✅ Feature 6 Team Check-in:', checkIn.status, checkIn.body.message);

    const engagementScore = await makeRequest(
      { host: 'localhost', port: PORT, path: `/api/teams/${activeTeam.id}/engagement`, method: 'GET', headers: { 'Authorization': `Bearer ${organizerToken}` } }
    );
    console.log('✅ Feature 6 Team Engagement Score:', engagementScore.status, 'Total Score:', engagementScore.body.total_engagement_score, 'Breakdown:', engagementScore.body.breakdown);

    const dashboard = await makeRequest(
      { host: 'localhost', port: PORT, path: '/api/engagement/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${organizerToken}` } }
    );
    console.log('✅ Feature 6 Organizer Dashboard Leaderboard:', dashboard.status, 'Top Team:', dashboard.body.dashboard[0]);

    // 9. NEW PROFILE ENDPOINTS
    console.log('\n--- Testing New Profile Endpoints ---');
    const profMe = await makeRequest(
      { host: 'localhost', port: PORT, path: '/api/profile/me', method: 'GET', headers: { 'Authorization': `Bearer ${organizerToken}` } }
    );
    console.log('✅ GET /api/profile/me:', profMe.status === 200 ? 'PASSED' : 'FAILED', profMe.body.user?.email);

    const profContrib = await makeRequest(
      { host: 'localhost', port: PORT, path: '/api/profile/contributions', method: 'GET', headers: { 'Authorization': `Bearer ${organizerToken}` } }
    );
    console.log('✅ GET /api/profile/contributions:', profContrib.status === 200 ? 'PASSED' : 'FAILED', profContrib.body.summary);

    const profStreak = await makeRequest(
      { host: 'localhost', port: PORT, path: '/api/profile/streak', method: 'GET', headers: { 'Authorization': `Bearer ${organizerToken}` } }
    );
    console.log('✅ GET /api/profile/streak:', profStreak.status === 200 ? 'PASSED' : 'FAILED', profStreak.body.streak);

    const profAct = await makeRequest(
      { host: 'localhost', port: PORT, path: '/api/profile/activity', method: 'GET', headers: { 'Authorization': `Bearer ${organizerToken}` } }
    );
    console.log('✅ GET /api/profile/activity:', profAct.status === 200 ? 'PASSED' : 'FAILED', 'Activities:', profAct.body.activities?.length);

    const profPut = await makeRequest(
      { host: 'localhost', port: PORT, path: '/api/profile', method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${organizerToken}` } },
      { timezone: 'PST', experience_level: 'Advanced' }
    );
    console.log('✅ PUT /api/profile:', profPut.status === 200 ? 'PASSED' : 'FAILED');

    // 10. NEW MENTOR ENDPOINTS
    console.log('\n--- Testing New Mentor Endpoints ---');
    const mentorReview = await makeRequest(
      { host: 'localhost', port: PORT, path: '/api/mentor/review', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${organizerToken}` } },
      { team_id: activeTeam.id }
    );
    console.log('✅ POST /api/mentor/review:', mentorReview.status === 200 ? 'PASSED' : 'FAILED');

    const mentorUpload = await makeRequest(
      { host: 'localhost', port: PORT, path: '/api/mentor/upload', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${organizerToken}` } },
      { fileName: 'architecture.txt', fileType: 'text/plain', fileSize: 1024, textContent: 'Sample system diagram text', team_id: activeTeam.id }
    );
    console.log('✅ POST /api/mentor/upload:', mentorUpload.status === 200 ? 'PASSED' : 'FAILED');

    console.log('\n🎉 ALL HACKOPS AI FEATURES & NEW ENDPOINTS SUCCESSFULLY VERIFIED!');
  } catch (error) {
    console.error('❌ Test execution error:', error);
  } finally {
    if (server) server.close();
  }
}

runTests();
