const http = require('http');

const BASE_PORT = process.env.PORT || 5001;

function makeRequest(path, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = { ...headers };
    if (payload) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: BASE_PORT,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let b = '';
        res.on('data', (c) => (b += c));
        res.on('end', () => {
          let json = {};
          try {
            json = JSON.parse(b);
          } catch (e) {
            json = { raw: b };
          }
          resolve({ status: res.statusCode, body: json });
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Running Comprehensive 32-Endpoint API Verification Suite...');
  let passCount = 0;
  let failCount = 0;

  async function testEndpoint(name, path, method = 'GET', headers = {}, body = null, expectedStatuses = [200, 201]) {
    try {
      const res = await makeRequest(path, method, headers, body);
      if (expectedStatuses.includes(res.status)) {
        console.log(` ✅ PASS [${res.status}] ${method} ${path} (${name})`);
        passCount++;
        return res.body;
      } else {
        console.error(` ❌ FAIL [${res.status}] ${method} ${path} (${name}) -> Error:`, res.body?.error || res.body?.message || res.body);
        failCount++;
        return null;
      }
    } catch (err) {
      console.error(` ❌ CRASH ${method} ${path} (${name}) ->`, err.message);
      failCount++;
      return null;
    }
  }

  // 1. Healthcheck
  await testEndpoint('Healthcheck', '/api/health');

  // 2. Login as Participant
  const loginRes = await testEndpoint('Participant Login', '/api/auth/login', 'POST', {}, {
    email: 'demo.participant@hackhub.ai',
    password: 'Demo@2026!',
  });

  const token = loginRes?.token;
  const participantId = loginRes?.user?.id;
  const authHeaders = { Authorization: `Bearer ${token}` };

  // 3. Login as Organizer
  const orgLoginRes = await testEndpoint('Organizer Login', '/api/auth/login', 'POST', {}, {
    email: 'demo.organizer@hackhub.ai',
    password: 'Demo@2026!',
  });
  const orgAuthHeaders = { Authorization: `Bearer ${orgLoginRes?.token}` };

  // 4. Register Participant
  await testEndpoint('Register Participant', '/api/auth/register', 'POST', {}, {
    name: 'New Test Participant',
    email: `test_${Date.now()}@hackhub.ai`,
    password: 'Password123!',
  });

  // 5. Create Staff (Organizer only)
  await testEndpoint('Create Staff Account', '/api/auth/create-staff', 'POST', orgAuthHeaders, {
    name: 'New Mentor Staff',
    email: `staff_${Date.now()}@hackhub.ai`,
    password: 'Password123!',
    role: 'mentor',
  });

  // 6. Get Current User /auth/me
  await testEndpoint('Get Current User Session', '/api/auth/me', 'GET', authHeaders);

  // 7. Profile Endpoints
  await testEndpoint('Get My Profile', '/api/profile/me', 'GET', authHeaders);
  await testEndpoint('Update Profile', '/api/profile', 'PUT', authHeaders, {
    bio: 'Updated AI Architect & MERN Developer',
    location: 'San Francisco, CA',
  });
  await testEndpoint('Get Profile Contributions', '/api/profile/contributions', 'GET', authHeaders);
  await testEndpoint('Get Profile Streak', '/api/profile/streak', 'GET', authHeaders);
  await testEndpoint('Get Activity Feed', '/api/profile/activity', 'GET', authHeaders);
  await testEndpoint('Post Activity Entry', '/api/profile/activity', 'POST', authHeaders, { event_type: 'check_in' });

  // 8. Teams Endpoints
  const teamsRes = await testEndpoint('Get All Teams', '/api/teams', 'GET', authHeaders);
  const teamId = teamsRes?.teams?.[0]?.id || 'team-1';
  await testEndpoint('Get Single Team Detail', `/api/teams/${teamId}`, 'GET', authHeaders);
  await testEndpoint('Team Check-In', `/api/teams/${teamId}/check-in`, 'POST', authHeaders);
  await testEndpoint('Get Team Engagement', `/api/teams/${teamId}/engagement`, 'GET', authHeaders);
  await testEndpoint('Get Engagement Dashboard', '/api/engagement/dashboard', 'GET', orgAuthHeaders);
  await testEndpoint('AI Team Match', '/api/teams/match', 'POST', authHeaders, { participants: [] });

  // 9. AI Mentor Endpoints
  await testEndpoint('AI Mentor Chat', '/api/mentor/chat', 'POST', authHeaders, {
    team_id: teamId,
    message: 'How can we test our MERN MongoDB backend API?',
    mode: 'developer',
  });
  await testEndpoint('AI Mentor History', `/api/mentor/history/${teamId}`, 'GET', authHeaders);
  await testEndpoint('AI Code Review', '/api/mentor/review', 'POST', authHeaders, {
    team_id: teamId,
    repo_link: 'https://github.com/neuralcrafters/hackops-agent',
  });
  await testEndpoint('AI File Upload Context', '/api/mentor/upload', 'POST', authHeaders, {
    fileName: 'architecture.txt',
    textContent: 'MERN stack backend architecture spec',
  });

  // 10. Direct Chat Endpoints
  await testEndpoint('Get Conversations', '/api/chat/conversations', 'GET', authHeaders);
  await testEndpoint('Get Direct Messages', `/api/chat/messages/${participantId}`, 'GET', authHeaders);
  await testEndpoint('Send Direct Message', '/api/chat/send', 'POST', authHeaders, {
    targetId: participantId,
    message: 'Hello from test suite!',
  });
  await testEndpoint('Get Suggested Connections', '/api/chat/suggested-connections', 'GET', authHeaders);
  await testEndpoint('Generate AI Intro', '/api/chat/ai-intro', 'POST', authHeaders, { target_user_id: participantId });

  // 11. Idea Validation Endpoint
  await testEndpoint('Validate Project Idea', '/api/ideas/validate', 'POST', authHeaders, {
    idea_description: 'Autonomous AI hackathon management OS with MERN + Groq LLM',
    hours_remaining: 12,
  });

  // 12. Submissions Endpoints
  const subRes = await testEndpoint('Create/Update Submission', '/api/submissions', 'POST', authHeaders, {
    team_id: teamId,
    title: 'HackHub AI MERN Suite',
    description: 'Complete MERN backend implementation for HackHub AI',
    repo_link: 'https://github.com/neuralcrafters/hackops-agent',
  });
  const subId = subRes?.submission?.id;
  await testEndpoint('Get All Submissions', '/api/submissions', 'GET', authHeaders);
  if (subId) {
    await testEndpoint('AI Evaluate Submission', `/api/submissions/${subId}/evaluate`, 'POST', authHeaders);
    await testEndpoint('Get AI Evaluation', `/api/submissions/${subId}/evaluation`, 'GET', authHeaders);
    await testEndpoint('Manual Judge Score', `/api/submissions/${subId}/manual-score`, 'PATCH', orgAuthHeaders, {
      judge_manual_score: 9.5,
    });
  }
  await testEndpoint('Check Submission Similarity', '/api/submissions/check-similarity', 'POST', orgAuthHeaders, { threshold: 0.5 });
  await testEndpoint('Get Similarity Flags', '/api/submissions/similarity-flags', 'GET', orgAuthHeaders);

  // 13. Analytics & Certificates Endpoints
  await testEndpoint('Get Analytics Dashboard', '/api/analytics/dashboard', 'GET', orgAuthHeaders);
  const certRes = await testEndpoint('Generate Certificate', '/api/analytics/certificates/generate', 'POST', orgAuthHeaders, {
    user_id: participantId,
  });
  await testEndpoint('Get User Certificates', '/api/analytics/certificates/user', 'GET', authHeaders);
  const hash = certRes?.certificate?.hash;
  if (hash) {
    await testEndpoint('Public Verify Certificate', `/api/analytics/certificates/verify/${hash}`, 'GET');
  }

  // 14. Sponsor Endpoints
  const sponsorLogin = await testEndpoint('Sponsor Login', '/api/auth/login', 'POST', {}, {
    email: 'demo.sponsor@hackhub.ai',
    password: 'Demo@2026!',
  });
  const sponsorHeaders = { Authorization: `Bearer ${sponsorLogin?.token}` };
  await testEndpoint('Get Sponsor Projects', '/api/sponsor/projects', 'GET', sponsorHeaders);
  await testEndpoint('Get Sponsor Talent', '/api/sponsor/talent', 'GET', sponsorHeaders);
  await testEndpoint('Add Sponsor Bookmark', '/api/sponsor/bookmark', 'POST', sponsorHeaders, {
    target_type: 'project',
    target_id: subId || 'sub-1',
  });
  await testEndpoint('Get Sponsor Bookmarks', '/api/sponsor/bookmarks', 'GET', sponsorHeaders);

  console.log('===============================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passCount} PASSED | ${failCount} FAILED out of ${passCount + failCount} tests.`);
  console.log('===============================================================');

  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((e) => {
  console.error('❌ Test suite crashed:', e);
  process.exit(1);
});
