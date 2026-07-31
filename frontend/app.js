const API_BASE = 'http://localhost:5001/api';

// State
let currentUser = {
  role: 'organizer',
  name: 'Alex Rivera (Organizer)',
  email: 'organizer@hackops.test',
  token: '',
};

let teamsCache = [];
let submissionsCache = [];

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initRoleModal();
  initApp();
  handleRoute();
});

// Handle URL Route Paths like /login, /teams, /mentor, /evaluations, /ideas, /similarity, /dashboard
function handleRoute() {
  const path = window.location.pathname.toLowerCase();
  let targetTab = 'team-matching';

  if (path.includes('login')) {
    document.getElementById('roleModal')?.classList.add('active');
  } else if (path.includes('mentor')) {
    targetTab = 'ai-mentor';
  } else if (path.includes('eval') || path.includes('submission')) {
    targetTab = 'project-eval';
  } else if (path.includes('idea')) {
    targetTab = 'idea-validator';
  } else if (path.includes('similar') || path.includes('plagiarism')) {
    targetTab = 'plagiarism';
  } else if (path.includes('dashboard') || path.includes('engagement') || path.includes('leaderboard')) {
    targetTab = 'engagement';
  } else if (path.includes('team')) {
    targetTab = 'team-matching';
  }

  const btn = document.querySelector(`.tab-btn[data-tab="${targetTab}"]`);
  if (btn) btn.click();
}

async function initApp() {
  await loginActiveUser();
  await loadStats();
  await loadUnmatchedParticipants();
  await loadTeams();
  await loadMentorContext();
  await loadSubmissions();
  await loadSimilarityFlags();
  await loadEngagementDashboard();
}

// ----------------------------------------------------
// Auth & Roles
// ----------------------------------------------------
async function loginActiveUser() {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser.email, password: 'Password123!' }),
    });
    const data = await res.json();
    if (data.token) {
      currentUser.token = data.token;
      document.getElementById('activeUserRole').innerText = currentUser.name;
    }
  } catch (err) {
    console.error('Login error:', err);
  }
}

function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${currentUser.token}`,
  };
}

function initRoleModal() {
  const modal = document.getElementById('roleModal');
  const btnSwap = document.getElementById('btnRoleSwap');
  const btnClose = document.getElementById('btnCloseRoleModal');
  const roleCards = document.querySelectorAll('.role-card');

  btnSwap.addEventListener('click', () => modal.classList.add('active'));
  btnClose.addEventListener('click', () => modal.classList.remove('active'));

  roleCards.forEach(card => {
    card.addEventListener('click', async () => {
      roleCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      currentUser.role = card.dataset.role;
      currentUser.email = card.dataset.email;
      currentUser.name = card.dataset.name;

      await loginActiveUser();
      await initApp();
      modal.classList.remove('active');
    });
  });
}

// ----------------------------------------------------
// Tab Switcher
// ----------------------------------------------------
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = `panel-${btn.dataset.tab}`;
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });
}

// ----------------------------------------------------
// Stats Banner
// ----------------------------------------------------
async function loadStats() {
  try {
    const teamsRes = await fetch(`${API_BASE}/teams`, { headers: getAuthHeaders() });
    const teamsData = await teamsRes.json();
    document.getElementById('statTeams').innerText = teamsData.teams?.length || 0;

    const subsRes = await fetch(`${API_BASE}/submissions`, { headers: getAuthHeaders() });
    const subsData = await subsRes.json();
    document.getElementById('statSubmissions').innerText = subsData.submissions?.length || 0;
  } catch (err) {
    console.error('Stats error:', err);
  }
}

// ----------------------------------------------------
// Feature 1: AI Team Formation
// ----------------------------------------------------
async function loadUnmatchedParticipants() {
  const container = document.getElementById('unmatchedRoster');
  if (!container) return;

  container.innerHTML = '<div class="placeholder-text"><i class="fa-solid fa-spinner fa-spin"></i> Loading participant roster...</div>';

  try {
    const participantsSample = [
      { name: 'Devon Lee', skills: ['Python', 'FastAPI', 'PyTorch'], exp: 'Advanced', interests: ['AI Agents'] },
      { name: 'Priya Sharma', skills: ['React', 'TypeScript', 'Figma'], exp: 'Intermediate', interests: ['UI/UX'] },
      { name: 'Liam O\'Connor', skills: ['Node.js', 'PostgreSQL', 'Docker'], exp: 'Intermediate', interests: ['Backend'] },
      { name: 'Elena Rostova', skills: ['Python', 'Transformers', 'Vector DBs'], exp: 'Advanced', interests: ['RAG'] },
    ];

    container.innerHTML = participantsSample.map(p => `
      <div class="participant-item">
        <div class="participant-head">
          <span><i class="fa-solid fa-user-code"></i> ${p.name}</span>
          <span class="badge badge-cyan">${p.exp}</span>
        </div>
        <div class="skill-tags">
          ${p.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-users-slash"></i>
        <h4>No Unmatched Participants</h4>
        <p>All participants have been assigned to balanced teams.</p>
      </div>
    `;
  }
}

async function loadTeams() {
  const container = document.getElementById('teamsList');
  const mentorSelect = document.getElementById('mentorTeamSelect');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/teams`, { headers: getAuthHeaders() });
    const data = await res.json();
    teamsCache = data.teams || [];

    if (teamsCache.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-people-group"></i>
          <h4>No Teams Formed Yet</h4>
          <p>Click "Form Teams with AI" above to group unmatched participants into balanced teams.</p>
        </div>
      `;
      if (mentorSelect) {
        mentorSelect.innerHTML = '<option value="">No active team assigned</option>';
        const chatBox = document.getElementById('chatHistory');
        if (chatBox) {
          chatBox.innerHTML = `
            <div class="empty-state">
              <i class="fa-solid fa-comments"></i>
              <h4>No Active Team Chat</h4>
              <p>Form or join a team to start chatting with your AI Mentor assistant!</p>
            </div>
          `;
        }
      }
      return;
    }

    container.innerHTML = teamsCache.map(t => `
      <div class="team-card">
        <div class="team-card-head">
          <span><i class="fa-solid fa-users"></i> ${t.name}</span>
          <span class="badge badge-green">${(t.members || []).length || 3} Members</span>
        </div>
        <div class="team-members">
          <strong>Members:</strong> ${(t.members || []).map(m => m.name).join(', ') || 'Assigned Participants'}
        </div>
        ${t.match_rationale_text ? `
          <div class="rationale-box">
            <strong><i class="fa-solid fa-brain"></i> AI Match Rationale:</strong> ${t.match_rationale_text}
          </div>
        ` : ''}
      </div>
    `).join('');

    if (mentorSelect) {
      mentorSelect.innerHTML = teamsCache.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
      if (teamsCache.length > 0) {
        loadMentorHistory(teamsCache[0].id);
      }
    }
  } catch (err) {
    console.error('Load teams error:', err);
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-exclamation-triangle"></i>
        <h4>Failed to Load Teams</h4>
        <p>Please check your backend connection and try again.</p>
      </div>
    `;
  }
}

document.getElementById('btnRunMatchmaker')?.addEventListener('click', async () => {
  const btn = document.getElementById('btnRunMatchmaker');
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Forming Teams with AI...';
  try {
    const res = await fetch(`${API_BASE}/teams/match`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ participants: [] }),
    });
    const data = await res.json();
    alert(data.message || 'Team formation complete!');
    await loadTeams();
    await loadStats();
  } catch (err) {
    alert('Team matchmaking error: ' + err.message);
  } finally {
    btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Form Teams with AI';
  }
});

// ----------------------------------------------------
// Feature 2: AI Mentor Assistant
// ----------------------------------------------------
async function loadMentorContext() {
  const rulesList = document.getElementById('rulebookRules');
  const tracksDiv = document.getElementById('rulebookTracks');

  if (rulesList) {
    rulesList.innerHTML = `
      <li>All project code must be created during the hackathon window.</li>
      <li>Teams are composed of 2 to 4 balanced members.</li>
      <li>Final submissions require a public GitHub repo link and demo video.</li>
    `;
  }

  if (tracksDiv) {
    tracksDiv.innerHTML = `
      <div style="font-size:0.78rem; color:var(--text-secondary); margin-top:0.4rem; line-height:1.5;">
        <div>🏆 <strong>Best AI Autonomous Agents</strong> ($10,000)</div>
        <div>⚡ <strong>Best Developer Productivity Tool</strong> ($5,000)</div>
        <div>🌟 <strong>Grand Champion Project</strong> ($15,000)</div>
      </div>
    `;
  }
}

document.getElementById('mentorTeamSelect')?.addEventListener('change', (e) => {
  if (e.target.value) {
    loadMentorHistory(e.target.value);
  }
});

async function loadMentorHistory(teamId) {
  const chatBox = document.getElementById('chatHistory');
  if (!chatBox) return;

  chatBox.innerHTML = '<div class="placeholder-text"><i class="fa-solid fa-spinner fa-spin"></i> Loading chat history...</div>';

  try {
    const res = await fetch(`${API_BASE}/mentor/history/${teamId}`, { headers: getAuthHeaders() });
    const data = await res.json();

    if (res.status === 403) {
      chatBox.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-lock"></i>
          <h4>Access Restricted</h4>
          <p>You can only view mentor chat history for your own team.</p>
        </div>
      `;
      return;
    }

    const history = data.history || [];

    if (history.length === 0) {
      chatBox.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-comments"></i>
          <h4>No Messages Yet</h4>
          <p>Ask a question below about bugs, hackathon rules, or architecture to start chatting!</p>
        </div>
      `;
      return;
    }

    chatBox.innerHTML = history.map(m => `
      <div class="chat-msg ${m.sender}">
        <strong>${m.sender === 'user' ? 'Team Member' : 'AI Mentor'}:</strong>
        <div>${m.content.replace(/\n/g, '<br>')}</div>
      </div>
    `).join('');

    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    chatBox.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-circle-exclamation"></i>
        <h4>Failed to Load History</h4>
        <p>Could not retrieve conversation records for this team.</p>
      </div>
    `;
  }
}

document.getElementById('mentorChatForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const teamSelect = document.getElementById('mentorTeamSelect');
  const teamId = teamSelect ? teamSelect.value : null;
  const msgInput = document.getElementById('mentorInputMsg');
  const repoInput = document.getElementById('mentorInputRepo');

  const message = msgInput.value;
  const repoLink = repoInput.value;

  if (!teamId || !message) {
    alert('Please select a team and type a message.');
    return;
  }

  const chatBox = document.getElementById('chatHistory');
  chatBox.innerHTML += `
    <div class="chat-msg user">
      <strong>You:</strong><div>${message}</div>
    </div>
    <div class="chat-msg mentor" id="tempLoading">
      <i class="fa-solid fa-spinner fa-spin"></i> AI Mentor analyzing rules & repo context...
    </div>
  `;
  chatBox.scrollTop = chatBox.scrollHeight;
  msgInput.value = '';

  try {
    const res = await fetch(`${API_BASE}/mentor/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ team_id: teamId, message, repo_link: repoLink }),
    });
    const data = await res.json();

    document.getElementById('tempLoading')?.remove();
    if (res.status === 403) {
      alert(data.error || 'Access denied.');
      return;
    }
    await loadMentorHistory(teamId);
    await loadEngagementDashboard();
  } catch (err) {
    document.getElementById('tempLoading')?.remove();
    alert('Failed to get mentor response.');
  }
});

// ----------------------------------------------------
// Feature 3: Project Evaluator
// ----------------------------------------------------
async function loadSubmissions() {
  const container = document.getElementById('submissionsList');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/submissions`, { headers: getAuthHeaders() });
    const data = await res.json();
    submissionsCache = data.submissions || [];

    if (submissionsCache.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-folder-open"></i>
          <h4>No Submissions Yet</h4>
          <p>No project submissions have been created for your account view.</p>
        </div>
      `;
      const content = document.getElementById('scorecardContent');
      if (content) {
        content.innerHTML = `
          <div class="empty-state">
            <i class="fa-solid fa-award"></i>
            <h4>No Submission Selected</h4>
            <p>Select a submission from the list on the left to trigger AI evaluation or view judge scorecards.</p>
          </div>
        `;
      }
      return;
    }

    container.innerHTML = submissionsCache.map(s => `
      <div class="participant-item" style="cursor:pointer; margin-bottom:0.6rem;" onclick="selectSubmissionForEval('${s.id}')">
        <div class="participant-head">
          <span><i class="fa-solid fa-code-branch"></i> ${s.team?.name || 'Hackathon Team'}</span>
          <span class="badge badge-green">${s.status}</span>
        </div>
        <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.25rem;">
          ${s.description.substring(0, 85)}...
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-circle-exclamation"></i>
        <h4>Failed to Load Submissions</h4>
      </div>
    `;
  }
}

window.selectSubmissionForEval = async function(id) {
  const content = document.getElementById('scorecardContent');
  if (!content) return;

  content.innerHTML = '<div class="placeholder-text"><i class="fa-solid fa-spinner fa-spin"></i> Running AI Scorecard Evaluation...</div>';

  try {
    await fetch(`${API_BASE}/submissions/${id}/evaluate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({}),
    });

    const res = await fetch(`${API_BASE}/submissions/${id}/evaluation`, { headers: getAuthHeaders() });
    const data = await res.json();

    if (res.status === 403) {
      content.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-lock"></i>
          <h4>Access Restricted</h4>
          <p>You can only view evaluation details for your own team's submission unless logged in as Judge/Organizer.</p>
        </div>
      `;
      return;
    }

    const sc = data.scorecard;

    content.innerHTML = `
      <div style="margin-bottom:1rem;">
        <h4 style="color:var(--accent-cyan-dark); font-size:1.15rem; font-family:var(--font-heading);">${data.team_name}</h4>
        <p style="font-size:0.8rem; color:var(--text-muted);">Repo: <a href="${data.repo_link}" target="_blank" style="color:var(--accent-cyan-dark); font-weight:600;">${data.repo_link}</a></p>
      </div>

      <div class="score-grid">
        <div class="score-box">
          <div class="score-num">${sc.ai_scorecard.originality_score}</div>
          <div class="score-title">Originality</div>
        </div>
        <div class="score-box">
          <div class="score-num">${sc.ai_scorecard.technical_depth_score}</div>
          <div class="score-title">Technical Depth</div>
        </div>
        <div class="score-box">
          <div class="score-num">${sc.ai_scorecard.completeness_score}</div>
          <div class="score-title">Completeness</div>
        </div>
        <div class="score-box">
          <div class="score-num">${sc.ai_scorecard.clarity_score}</div>
          <div class="score-title">Clarity</div>
        </div>
      </div>

      <div class="rationale-box" style="margin-bottom:1.1rem;">
        <strong><i class="fa-solid fa-robot"></i> AI Scorecard Justification:</strong><br>${sc.ai_scorecard.ai_justification_text}
      </div>

      <div style="background:var(--bg-card-subtle); padding:0.9rem; border-radius:10px; border:1px solid var(--border-color);">
        <label style="font-size:0.84rem; font-weight:700; color:var(--text-primary);"><i class="fa-solid fa-gavel"></i> Judge Manual Score (0 - 10):</label>
        <div style="display:flex; gap:0.6rem; margin-top:0.5rem;">
          <input type="number" id="manualScoreInput" step="0.1" min="0" max="10" value="${sc.judge_manual_scorecard.judge_manual_score || 9.0}" style="width:110px; padding:0.45rem;">
          <button class="btn btn-primary" onclick="saveManualScore('${id}')">Save Score</button>
        </div>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-circle-exclamation"></i>
        <h4>Evaluation Processing Error</h4>
        <p>Could not retrieve scorecard details.</p>
      </div>
    `;
  }
};

window.saveManualScore = async function(id) {
  const score = parseFloat(document.getElementById('manualScoreInput').value);
  try {
    const res = await fetch(`${API_BASE}/submissions/${id}/manual-score`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ judge_manual_score: score }),
    });
    const data = await res.json();
    if (res.status === 403) {
      alert(data.error || 'Only judges or organizers can save manual scores.');
      return;
    }
    alert('Judge manual score updated successfully!');
    selectSubmissionForEval(id);
  } catch (err) {
    alert('Failed to update manual score.');
  }
};

document.getElementById('btnRefreshSubmissions')?.addEventListener('click', loadSubmissions);

// ----------------------------------------------------
// Feature 4: Idea Validator
// ----------------------------------------------------
document.getElementById('ideaForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const desc = document.getElementById('ideaDescription').value;
  const hours = document.getElementById('hoursRemaining').value;
  const container = document.getElementById('ideaReportContainer');

  container.innerHTML = '<div class="placeholder-text"><i class="fa-solid fa-spinner fa-spin"></i> Validating Idea Feasibility with AI...</div>';

  try {
    const res = await fetch(`${API_BASE}/ideas/validate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ idea_description: desc, hours_remaining: hours }),
    });
    const data = await res.json();
    const v = data.validation;

    const badgeClass = v.feasibility === 'green' ? 'badge-green' : (v.feasibility === 'yellow' ? 'badge-amber' : 'badge-red');

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <h4 style="font-family:var(--font-heading); font-size:1.05rem; font-weight:700;">Feasibility Rating</h4>
        <span class="badge ${badgeClass}" style="font-size:0.85rem; padding:0.35rem 0.85rem;">
          ${v.feasibility.toUpperCase()} RISK
        </span>
      </div>

      <div class="rationale-box" style="margin-bottom:0.9rem;">
        <strong>Scope & Feasibility Note (${hours}h remaining):</strong><br>${v.scope_note}
      </div>

      <div style="background:var(--bg-card-subtle); padding:0.9rem; border-radius:10px; margin-bottom:0.9rem; border:1px solid var(--border-color);">
        <strong style="color:var(--accent-cyan-dark); font-size:0.85rem;"><i class="fa-solid fa-star"></i> Originality Assessment:</strong>
        <p style="font-size:0.82rem; color:var(--text-secondary); margin-top:0.3rem; line-height:1.45;">${v.originality}</p>
      </div>

      <div style="background:var(--accent-green-bg); border-left:3px solid var(--accent-green-dark); padding:0.9rem; border-radius:0 8px 8px 0;">
        <strong style="color:var(--accent-green-dark); font-size:0.85rem;"><i class="fa-solid fa-scissors"></i> Suggested MVP Cut:</strong>
        <p style="font-size:0.82rem; color:var(--text-primary); margin-top:0.3rem; line-height:1.45;">${v.suggested_mvp}</p>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-circle-exclamation"></i>
        <h4>Validation Failed</h4>
        <p>Unable to assess project idea at this time.</p>
      </div>
    `;
  }
});

// ----------------------------------------------------
// Feature 5: Similarity Checker
// ----------------------------------------------------
async function loadSimilarityFlags() {
  const container = document.getElementById('similarityResultsList');
  const countBadge = document.getElementById('badgeFlagCount');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/submissions/similarity-flags`, { headers: getAuthHeaders() });

    if (res.status === 403) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-lock"></i>
          <h4>Staff Access Only</h4>
          <p>Similarity and plagiarism detection flags are restricted to Organizers and Judges.</p>
        </div>
      `;
      if (countBadge) countBadge.innerText = 'Restricted';
      return;
    }

    const data = await res.json();
    const flags = data.flagged_pairs || [];

    if (countBadge) countBadge.innerText = `${flags.length} Flagged Pair(s)`;

    if (flags.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-shield-check"></i>
          <h4>No Similarity Flags Detected</h4>
          <p>All scanned project submissions show distinct original content under the 85% threshold.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = flags.map(f => `
      <div style="background:var(--accent-red-bg); border:1px solid #fca5a5; padding:1rem; border-radius:10px; margin-top:0.85rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.45rem;">
          <strong style="color:var(--accent-red);"><i class="fa-solid fa-triangle-exclamation"></i> High Similarity Detected (${(f.similarityScore * 100).toFixed(1)}%)</strong>
          <span class="badge badge-red">REQUIRES REVIEW</span>
        </div>
        <div style="font-size:0.84rem; color:var(--text-primary); display:grid; grid-template-columns:1fr 1fr; gap:0.85rem; margin-top:0.4rem;">
          <div>
            <strong>Team A:</strong> ${f.submissionA?.team_name || 'NeuralCrafters'}<br>
            <span style="color:var(--text-muted); font-size:0.78rem;">${(f.submissionA?.description || '').substring(0, 90)}...</span>
          </div>
          <div>
            <strong>Team B:</strong> ${f.submissionB?.team_name || 'DataPulse AI'}<br>
            <span style="color:var(--text-muted); font-size:0.78rem;">${(f.submissionB?.description || '').substring(0, 90)}...</span>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-circle-exclamation"></i>
        <h4>Failed to Fetch Similarity Scan</h4>
      </div>
    `;
  }
}

document.getElementById('btnRunSimilarityCheck')?.addEventListener('click', async () => {
  const btn = document.getElementById('btnRunSimilarityCheck');
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Scanning Embeddings...';
  try {
    const res = await fetch(`${API_BASE}/submissions/check-similarity`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ threshold: 0.85 }),
    });
    if (res.status === 403) {
      alert('Only Organizers and Judges can trigger similarity scans.');
      return;
    }
    await loadSimilarityFlags();
    await loadStats();
  } catch (err) {
    alert('Similarity check failed.');
  } finally {
    btn.innerHTML = '<i class="fa-solid fa-magnifying-glass-chart"></i> Run Similarity Scan';
  }
});

// ----------------------------------------------------
// Feature 6: Live Engagement Dashboard
// ----------------------------------------------------
async function loadEngagementDashboard() {
  const tbody = document.getElementById('leaderboardTbody');
  if (!tbody) return;

  try {
    const res = await fetch(`${API_BASE}/engagement/dashboard`, { headers: getAuthHeaders() });

    if (res.status === 403) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8">
            <div class="empty-state">
              <i class="fa-solid fa-lock"></i>
              <h4>Staff Dashboard Access Only</h4>
              <p>The global live leaderboard is visible to Organizers, Judges, and Mentors.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    const data = await res.json();
    const dashboard = data.dashboard || [];

    if (dashboard.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8">
            <div class="empty-state">
              <i class="fa-solid fa-fire-burner"></i>
              <h4>No Team Activity Logged</h4>
              <p>Team check-ins, mentor chat messages, and submission updates will appear here live.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    if (dashboard[0]) {
      const topStat = document.getElementById('statTopEngagement');
      if (topStat) topStat.innerText = `${dashboard[0].total_score} pts`;
    }

    tbody.innerHTML = dashboard.map((item, idx) => `
      <tr>
        <td><strong>#${idx + 1}</strong></td>
        <td style="color:var(--accent-cyan-dark); font-weight:700;"><i class="fa-solid fa-users"></i> ${item.team_name}</td>
        <td>${item.events_breakdown?.check_in || 0}</td>
        <td>${item.events_breakdown?.chat_message || 0}</td>
        <td>${(item.events_breakdown?.submission_create || 0) + (item.events_breakdown?.submission_update || 0)}</td>
        <td style="font-weight:800; color:var(--accent-green-dark); font-size:0.95rem;">${item.total_score} pts</td>
        <td><span class="badge badge-green">${item.submission_status}</span></td>
        <td>
          <button class="btn btn-secondary" style="padding:0.3rem 0.7rem; font-size:0.75rem;" onclick="triggerCheckIn('${item.team_id}')">
            <i class="fa-solid fa-check-double"></i> Check-in (+5pt)
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="8" class="placeholder-text">Failed to load dashboard.</td></tr>';
  }
}

window.triggerCheckIn = async function(teamId) {
  try {
    const res = await fetch(`${API_BASE}/teams/${teamId}/check-in`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (res.status === 403) {
      alert(data.error || 'Access denied. You are not authorized to check-in for this team.');
      return;
    }
    alert(data.message || 'Check-in recorded!');
    await loadEngagementDashboard();
  } catch (err) {
    alert('Check-in failed.');
  }
};

document.getElementById('btnRefreshDashboard')?.addEventListener('click', loadEngagementDashboard);
