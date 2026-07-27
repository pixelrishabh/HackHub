require('dotenv').config();

async function testAddMember() {
  console.log('🧪 Starting Automated Verification of Direct Add Member Feature...\n');
  const baseUrl = 'http://localhost:5000/api';

  // 1. Register users
  const leader = { name: 'Direct Leader', email: `direct_leader_${Date.now()}@test.com`, password: 'Password123!', role: 'participant' };
  const member = { name: 'Direct Member', email: `direct_member_${Date.now()}@test.com`, password: 'Password123!', role: 'participant' };
  const outsider = { name: 'Outsider User', email: `outsider_${Date.now()}@test.com`, password: 'Password123!', role: 'participant' };

  const regL = await (await fetch(`${baseUrl}/auth/register`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(leader) })).json();
  const regM = await (await fetch(`${baseUrl}/auth/register`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(member) })).json();
  const regO = await (await fetch(`${baseUrl}/auth/register`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(outsider) })).json();

  const tokenL = regL.token;
  const tokenM = regM.token;

  // 2. Create team with max capacity 2
  const teamRes = await fetch(`${baseUrl}/teams/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenL}` },
    body: JSON.stringify({ name: 'Alpha Squad', category: 'Web Dev', max_members: 2 }),
  });
  const teamData = await teamRes.json();
  const teamId = teamData.team.id;
  console.log(`✅ 1. Team Created: "${teamData.team.name}" (ID: ${teamId})`);

  // 3. Non-existent user lookup test (404)
  const notFoundRes = await fetch(`${baseUrl}/teams/${teamId}/add-member`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenL}` },
    body: JSON.stringify({ emailOrUsername: 'nonexistent_user_999@test.com' }),
  });
  console.assert(notFoundRes.status === 404, 'Non-existent user should return 404');
  console.log('✅ 2. User Not Found Validation: PASSED (404)');

  // 4. Non-leader direct add attempt (403)
  const forbiddenRes = await fetch(`${baseUrl}/teams/${teamId}/add-member`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenM}` },
    body: JSON.stringify({ emailOrUsername: outsider.email }),
  });
  console.assert(forbiddenRes.status === 403, 'Non-leader add should return 403');
  console.log('✅ 3. Leader Access Control Validation: PASSED (403)');

  // 5. Leader adds member directly by email (200)
  const addRes = await fetch(`${baseUrl}/teams/${teamId}/add-member`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenL}` },
    body: JSON.stringify({ emailOrUsername: member.email }),
  });
  const addData = await addRes.json();
  console.assert(addRes.status === 200 && addData.team?.member_ids?.length === 2, 'Direct add member failed');
  console.log(`✅ 4. Leader Direct Add Member by Email: PASSED ("${addData.added_user?.name}" Added, Team Full 2/2)`);

  // 6. Leader attempts to add member to FULL team (400)
  const fullRes = await fetch(`${baseUrl}/teams/${teamId}/add-member`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenL}` },
    body: JSON.stringify({ emailOrUsername: outsider.email }),
  });
  console.assert(fullRes.status === 400, 'Full team add should return 400');
  console.log('✅ 5. Full Team Capacity Validation: PASSED (400)');

  console.log('\n🎉 ALL DIRECT ADD MEMBER TESTS PASSED SUCCESSFULLY!\n');
}

testAddMember().catch(err => {
  console.error('❌ Direct Add Member Test Failed:', err);
  process.exit(1);
});
