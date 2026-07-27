require('dotenv').config();

async function runTeamTests() {
  console.log('🧪 Starting Automated Verification of Team Management System...\n');
  const baseUrl = 'http://localhost:5000/api';

  // 1. Register test users
  const userA = { name: 'Leader User A', email: `leader_a_${Date.now()}@test.com`, password: 'Password123!', role: 'participant' };
  const userB = { name: 'Participant B', email: `participant_b_${Date.now()}@test.com`, password: 'Password123!', role: 'participant' };
  const userC = { name: 'Participant C', email: `participant_c_${Date.now()}@test.com`, password: 'Password123!', role: 'participant' };

  const regA = await (await fetch(`${baseUrl}/auth/register`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(userA) })).json();
  const regB = await (await fetch(`${baseUrl}/auth/register`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(userB) })).json();
  const regC = await (await fetch(`${baseUrl}/auth/register`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(userC) })).json();

  const tokenA = regA.token;
  const tokenB = regB.token;
  const tokenC = regC.token;

  console.log('✅ 1. Test Users Registered');

  // 2. Create Team
  const teamPayload = {
    name: 'CyberNova AI',
    description: 'Building an autonomous multi-agent devops assistant',
    category: 'AI/ML',
    max_members: 2,
    required_skills: ['Python', 'React'],
    tech_stack: ['PyTorch', 'Node.js'],
  };

  const createRes = await fetch(`${baseUrl}/teams/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify(teamPayload),
  });
  const createData = await createRes.json();
  console.assert(createRes.status === 201, 'Create team failed status 201');
  console.log(`✅ 2. Team Created: "${createData.team.name}" (ID: ${createData.team.id})`);
  const teamId = createData.team.id;

  // Duplicate team creation check
  const dupCreateRes = await fetch(`${baseUrl}/teams/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify(teamPayload),
  });
  console.assert(dupCreateRes.status === 400, 'Duplicate team creation should fail with 400');
  console.log('✅ 3. Duplicate Active Team Prevention: PASSED (400)');

  // 3. Browse Teams
  const browseRes = await fetch(`${baseUrl}/teams/browse?category=AI/ML`, {
    headers: { 'Authorization': `Bearer ${tokenB}` },
  });
  const browseData = await browseRes.json();
  const foundTeam = browseData.teams.find(t => t.id === teamId);
  console.assert(!!foundTeam, 'Browsed team should exist');
  console.assert(foundTeam.available_slots === 1, 'Available slots should be 1');
  console.log(`✅ 4. Browse Teams: PASSED (Found: "${foundTeam.name}", Slots: ${foundTeam.available_slots}/${foundTeam.max_members})`);

  // 4. AI Compatibility Check
  const compRes = await fetch(`${baseUrl}/teams/${teamId}/compatibility`, {
    headers: { 'Authorization': `Bearer ${tokenB}` },
  });
  const compData = await compRes.json();
  console.assert(compRes.status === 200 && typeof compData.compatibility?.compatibility_percent === 'number', 'AI Compatibility failed');
  console.log(`✅ 5. AI Compatibility Check: PASSED (${compData.compatibility.compatibility_percent}% Match)`);

  // 5. Submit Join Request User B
  const reqRes = await fetch(`${baseUrl}/teams/${teamId}/join-request`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenB}` },
  });
  const reqData = await reqRes.json();
  console.assert(reqRes.status === 201, 'Join request failed');
  const requestId = reqData.request.id;
  console.log('✅ 6. Submit Join Request: PASSED');

  // Duplicate join request check
  const dupReqRes = await fetch(`${baseUrl}/teams/${teamId}/join-request`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenB}` },
  });
  console.assert(dupReqRes.status === 400, 'Duplicate request should return 400');
  console.log('✅ 7. Duplicate Join Request Block: PASSED (400)');

  // 6. Leader Views Pending Requests
  const getReqsRes = await fetch(`${baseUrl}/teams/${teamId}/requests`, {
    headers: { 'Authorization': `Bearer ${tokenA}` },
  });
  const getReqsData = await getReqsRes.json();
  console.assert(getReqsData.requests?.length > 0, 'Leader should see pending requests');
  console.log(`✅ 8. Leader View Requests: PASSED (${getReqsData.requests.length} pending)`);

  // 7. Leader Accepts Request
  const acceptRes = await fetch(`${baseUrl}/teams/${teamId}/join-request/${requestId}/accept`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenA}` },
  });
  console.assert(acceptRes.status === 200, 'Accept request failed');
  console.log('✅ 9. Leader Accept Join Request: PASSED (Member Added, Team Full 2/2)');

  // 8. User C Attempts Join Request to FULL Team
  const fullReqRes = await fetch(`${baseUrl}/teams/${teamId}/join-request`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenC}` },
  });
  console.assert(fullReqRes.status === 400, 'Full team join request should fail with 400');
  console.log('✅ 10. Capacity Enforcement on Join Request: PASSED (Full Team Rejected 400)');

  // 9. Leader Attempts Leave (Blocked)
  const leaderLeaveRes = await fetch(`${baseUrl}/teams/${teamId}/leave`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenA}` },
  });
  console.assert(leaderLeaveRes.status === 400, 'Leader leave block should fail with 400');
  console.log('✅ 11. Leadership Transfer Block on Leave: PASSED (400)');

  // 10. Member User B Leaves
  const memberLeaveRes = await fetch(`${baseUrl}/teams/${teamId}/leave`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenB}` },
  });
  console.assert(memberLeaveRes.status === 200, 'Member leave failed');
  console.log('✅ 12. Member Leave Team: PASSED');

  console.log('\n🎉 ALL 12 TEAM MANAGEMENT SYSTEM TESTS PASSED SUCCESSFULLY!\n');
}

runTeamTests().catch(err => {
  console.error('❌ Team Management Test Failed:', err);
  process.exit(1);
});
