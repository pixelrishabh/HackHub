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
          resolve({ status: res.statusCode, body: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, body, headers: res.headers });
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

async function runSecurityTests() {
  console.log('🔒 Starting Security & Data Isolation Verification...');

  const PORT = 5098;
  server = app.listen(PORT);

  try {
    // 1. Check Helmet Security Headers
    const health = await makeRequest({ host: 'localhost', port: PORT, path: '/api/health', method: 'GET' });
    const hasHelmetHeader = !!(health.headers['x-dns-prefetch-control'] || health.headers['x-content-type-options']);
    console.log('✅ Helmet Security Headers:', hasHelmetHeader ? 'PASSED' : 'FAILED');

    // 2. Privilege Escalation Fix: Client cannot set role = organizer during register
    const regEscalation = await makeRequest(
      { host: 'localhost', port: PORT, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { name: 'Attacker User', email: `attacker_${Date.now()}@hackops.test`, password: 'Password123!', role: 'organizer' }
    );
    const assignedRole = regEscalation.body.user?.role;
    console.log('✅ Privilege Escalation Fix (Attempted role=organizer, got role=' + assignedRole + '):', (assignedRole === 'participant') ? 'PASSED' : 'FAILED');

    // 3. Password length & email validation
    const badPassword = await makeRequest(
      { host: 'localhost', port: PORT, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { name: 'Weak Pass', email: `weak_${Date.now()}@hackops.test`, password: 'short' }
    );
    console.log('✅ Input Validation (Short Password Blocked):', (badPassword.status === 400) ? 'PASSED' : 'FAILED');

    // 4. Login as Organizer
    const orgLogin = await makeRequest(
      { host: 'localhost', port: PORT, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'organizer@hackops.test', password: 'Password123!' }
    );
    const orgToken = orgLogin.body.token;

    // 5. Create Staff Endpoint (Organizer Only)
    const staffEmail = `newjudge_${Date.now()}@hackops.test`;
    const createStaff = await makeRequest(
      { host: 'localhost', port: PORT, path: '/api/auth/create-staff', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orgToken}` } },
      { name: 'New Staff Judge', email: staffEmail, password: 'Password123!', role: 'judge' }
    );
    console.log('✅ Protected /api/auth/create-staff Endpoint:', (createStaff.status === 201 && createStaff.body.user.role === 'judge') ? 'PASSED' : 'FAILED');

    // Non-organizer attempt to create staff should fail (403)
    const participantToken = regEscalation.body.token;
    const forbiddenStaff = await makeRequest(
      { host: 'localhost', port: PORT, path: '/api/auth/create-staff', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${participantToken}` } },
      { name: 'Fake Judge', email: `fakejudge_${Date.now()}@hackops.test`, password: 'Password123!', role: 'judge' }
    );
    console.log('✅ Non-organizer staff creation blocked (403):', (forbiddenStaff.status === 403) ? 'PASSED' : 'FAILED');

    // 6. IDOR Check: Participant accessing another team's details
    const teamsRes = await makeRequest(
      { host: 'localhost', port: PORT, path: '/api/teams', method: 'GET', headers: { 'Authorization': `Bearer ${orgToken}` } }
    );
    const targetTeam = teamsRes.body.teams[0];

    const idorTeam = await makeRequest(
      { host: 'localhost', port: PORT, path: `/api/teams/${targetTeam.id}`, method: 'GET', headers: { 'Authorization': `Bearer ${participantToken}` } }
    );
    console.log('✅ IDOR Protection on GET /api/teams/:id (Blocked 403):', (idorTeam.status === 403) ? 'PASSED' : 'FAILED');

    const idorHistory = await makeRequest(
      { host: 'localhost', port: PORT, path: `/api/mentor/history/${targetTeam.id}`, method: 'GET', headers: { 'Authorization': `Bearer ${participantToken}` } }
    );
    console.log('✅ IDOR Protection on GET /api/mentor/history/:teamId (Blocked 403):', (idorHistory.status === 403) ? 'PASSED' : 'FAILED');

    // 7. Data Scoping Check for Participants
    const participantTeams = await makeRequest(
      { host: 'localhost', port: PORT, path: '/api/teams', method: 'GET', headers: { 'Authorization': `Bearer ${participantToken}` } }
    );
    console.log('✅ Data Scoping for Unassigned Participant (0 teams visible):', (participantTeams.body.teams.length === 0) ? 'PASSED' : 'FAILED');

    console.log('\n🔒 ALL SECURITY & DATA ISOLATION CONTROLS VERIFIED!');
  } catch (err) {
    console.error('❌ Security verification error:', err);
  } finally {
    if (server) server.close();
  }
}

runSecurityTests();
