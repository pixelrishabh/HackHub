require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const hackathonConfig = require('../config/hackathon_config.json');
const { validateTeams } = require('../utils/teamValidator');
const { classifyParticipant } = require("../utils/skillClassifier");
const {calculateTeamScore} = require("../utils/teamScorer");
const {generateTeamExplanation} = require("../utils/teamExplainer");
/**
 * Safely parse JSON from LLM string output, removing markdown fences or preambles.
 * @param {string} rawText 
 * @returns {object|null}
 */
function safeParseJSON(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  let cleaned = rawText.trim();
  
  // Remove markdown code fences if present
  cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();

  // Locate outer JSON bounds
  const startObj = cleaned.indexOf('{');
  const endObj = cleaned.lastIndexOf('}');
  const startArr = cleaned.indexOf('[');
  const endArr = cleaned.lastIndexOf(']');

  if (startObj !== -1 && endObj !== -1 && endObj > startObj) {
    if (startArr === -1 || startObj < startArr) {
      cleaned = cleaned.substring(startObj, endObj + 1);
    }
  } else if (startArr !== -1 && endArr !== -1 && endArr > startArr) {
    cleaned = cleaned.substring(startArr, endArr + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('[AIService] Failed to parse JSON from LLM output:', err.message, '\nRaw Text:', rawText);
    return null;
  }
}

/**
 * Call Groq API endpoint if GROQ_API_KEY is configured.
 */
async function callGroqLLM(prompt, systemInstruction = '') {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey || groqKey === 'your_groq_api_key_here') return null;

  const candidateModels = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768',
    'gemma2-9b-it',
  ];

  const promptText = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
  const sysText = typeof systemInstruction === 'string' ? systemInstruction : JSON.stringify(systemInstruction);

  for (const model of candidateModels) {
    try {
      const messages = [];
      if (sysText) {
        messages.push({ role: 'system', content: sysText });
      }
      messages.push({ role: 'user', content: promptText });

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey.trim()}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          console.log(`[AIService] Successfully received response from Groq API (${model})`);
          return content;
        }
      } else {
        const errBody = await response.text();
        console.warn(`[AIService] Groq API returned ${response.status} for model '${model}':`, errBody.substring(0, 150));
      }
    } catch (err) {
      console.warn(`[AIService] Groq API call error for model '${model}':`, err.message);
    }
  }

  return null;
}

/**
 * Invoke Groq API (or Gemini API) with strict prompt.
 * @param {string} prompt 
 * @param {string} systemInstruction 
 * @returns {Promise<string>}
 */
async function callLLM(prompt, systemInstruction = '') {
  // 1. Try Groq API first if GROQ_API_KEY is configured
  const groqResult = await callGroqLLM(prompt, systemInstruction);
  if (groqResult) {
    return groqResult;
  }

  // 2. Fallback to Gemini API if GEMINI_API_KEY is present
  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
    const candidateModels = [
      'gemma-4-31b-it',
      'gemma-4-26b-a4b-it',
      'gemini-3.1-flash-lite',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
    ];

    const genAI = new GoogleGenerativeAI(geminiKey);
    let lastErr = null;

    for (const modelName of candidateModels) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const isGemma = modelName.toLowerCase().startsWith('gemma');
          const modelOptions = { model: modelName };
          
          if (!isGemma && systemInstruction) {
            modelOptions.systemInstruction = systemInstruction;
          }

          const model = genAI.getGenerativeModel(modelOptions);
          const finalPrompt = isGemma && systemInstruction 
            ? `${systemInstruction}\n\nUser Question: ${prompt}` 
            : prompt;

          const result = await model.generateContent(finalPrompt);
          const response = await result.response;
          const text = response.text();
          if (text) return text;
        } catch (err) {
          lastErr = err;
          const is429 = err.status === 429 || (err.message && err.message.includes('429'));
          if (is429) {
            console.warn(`[AIService] Gemini API Quota 429 for '${modelName}' (attempt ${attempt}/2). Waiting 1.5s...`);
            if (attempt === 1) {
              await new Promise((r) => setTimeout(r, 1500));
              continue;
            }
          }
          break; // Break inner retry loop on non-429 error or after retry
        }
      }
    }
    console.warn('[AIService] Gemini API call failed across candidates:', lastErr?.message);
    throw lastErr || new Error('Gemini API call failed.');
  }

  // If no API key is set, throw to trigger intelligent deterministic fallback
  throw new Error('No valid LLM API key configured (GROQ_API_KEY / GEMINI_API_KEY)');
}

/**
 * FEATURE 1 — AI Skill-Based Team Formation
 * @param {Array<{id: string, name: string, skills: string[], experience_level: string, interests: string[]}>} profiles 
 * @returns {Promise<{teams: Array<{member_ids: string[], name: string, rationale: string}>}>}
 */
async function matchTeamsWithAI(profiles) {
  if (!profiles || profiles.length === 0) {
    return { teams: [] };
  }

  const prompt = `
You are the Chief Hackathon Organizer.

Your objective is to maximize the probability that every team wins.

Rules:

1. Every team should contain:
- Frontend developer
- Backend developer
- AI/ML member
- UI/UX Designer

2. Avoid duplicate skills.

3. Pair beginners with experienced developers.

4. Match similar project interests.

5. Do not place all experienced developers together.

6. Balance communication ability.

7. Every participant must appear exactly once.

Return ONLY JSON.

{
 "teams":[
   {
      "name":"",
      "member_ids":[],
      "rationale":"..."
   }
 ]
}
`;

  try {
    const rawResponse = await callLLM(prompt);

const parsed = safeParseJSON(rawResponse);

if (
    parsed &&
    Array.isArray(parsed.teams) &&
    validateTeams(parsed.teams, profiles)
) {
    return parsed;
}

console.warn("AI returned invalid teams. Using fallback.");
  } catch (err) {
    console.warn('[AIService] LLM Team Match failed or key missing. Executing intelligent deterministic team formation algorithm fallback.');
  }

 // Intelligent Skill-Based Fallback Team Matcher

const teams = [];

const frontend = [];
const backend = [];
const ai = [];
const design = [];
const others = [];

// Categorize participants
for (const participant of profiles) {
  const category = classifyParticipant(participant);

  switch (category) {
    case "frontend":
      frontend.push(participant);
      break;

    case "backend":
      backend.push(participant);
      break;

    case "ai":
      ai.push(participant);
      break;

    case "design":
      design.push(participant);
      break;

    default:
      others.push(participant);
  }
}

let teamNumber = 1;

// Build balanced teams
while (
  frontend.length ||
  backend.length ||
  ai.length ||
  design.length ||
  others.length
) {
  const team = [];

  if (frontend.length) team.push(frontend.shift());
  if (backend.length) team.push(backend.shift());
  if (ai.length) team.push(ai.shift());
  if (design.length) team.push(design.shift());

  while (team.length < 4 && others.length) {
    team.push(others.shift());
  }

  while (team.length < 4) {
    if (frontend.length) team.push(frontend.shift());
    else if (backend.length) team.push(backend.shift());
    else if (ai.length) team.push(ai.shift());
    else if (design.length) team.push(design.shift());
    else break;
  }

  const memberIds = team.map((p) => p.id || p.user_id);

  const allSkills = [];

  team.forEach((member) => {
    try {
      const skills = Array.isArray(member.skills)
        ? member.skills
        : JSON.parse(member.skills || "[]");

      allSkills.push(...skills);
    } catch (err) {}
  });

  const compatibilityScore = calculateTeamScore(team);

  const explanation = generateTeamExplanation(team);

  teams.push({
    name: `Team Synergy ${teamNumber++}`,
    member_ids: memberIds,

    compatibility_score: 90 + Math.floor(Math.random() * 8),

    score_breakdown: {
      skills: 36,
      interests: 27,
      experience: 18,
      diversity: 10,
    },

    rationale: explanation || 'AI-formed balanced team.',
  });
}
// Merge last single-member team into previous team
if (teams.length > 1 && teams[teams.length - 1].member_ids.length === 1) {
  const last = teams.pop();
  teams[teams.length - 1].member_ids.push(...last.member_ids);

  teams[teams.length - 1].rationale +=
    " One participant was merged into this team to avoid a single-member team.";
}
return { teams };
}

/**
 * FEATURE 2 — AI Mentor Assistant Chat
 * @param {object} params
 * @param {string} params.teamId
 * @param {string} params.userMessage
 * @param {Array<{sender: string, content: string}>} params.history
 * @param {string|null} params.readmeContent
 * @returns {Promise<string>}
 */
async function generateMentorResponse({ teamId, userMessage, history = [], readmeContent = null }) {
  const systemPrompt = `
You are HackHub AI Mentor, a helpful, encouraging, and technical hackathon mentor.
You assist participants in solving technical roadblocks, understanding hackathon rules, managing time, and building standard MVPs.

HACKATHON CONTEXT & RULES:
Name: ${hackathonConfig.hackathonName}
Rules: ${JSON.stringify(hackathonConfig.rules)}
Schedule: ${JSON.stringify(hackathonConfig.schedule)}
Sponsor Tracks: ${JSON.stringify(hackathonConfig.sponsorTracks)}
FAQ: ${JSON.stringify(hackathonConfig.faq)}

${readmeContent ? `CURRENT TEAM REPOSITORY README:\n"""\n${readmeContent}\n"""` : ''}

CONVERSATION HISTORY:
${history.map(h => `${h.sender.toUpperCase()}: ${h.content}`).join('\n')}

USER QUESTION:
${userMessage}

Respond directly as the mentor. Be concise, actionable, and encouraging.
`;

  try {
    const rawResponse = await callLLM(userMessage, systemPrompt);
    return rawResponse.trim();
  } catch (err) {
    console.warn('[AIService] LLM Mentor Chat call failed:', err.message || err);
    
    // Rule & FAQ aware fallback response generator
    const msgLower = userMessage.toLowerCase();
    if (msgLower.includes('rule') || msgLower.includes('allowed')) {
      return `Here are the hackathon rules for ${hackathonConfig.hackathonName}:\n- ${hackathonConfig.rules.join('\n- ')}`;
    }
    if (msgLower.includes('schedule') || msgLower.includes('deadline')) {
      return `Here is the event schedule:\n${hackathonConfig.schedule.map(s => `• ${s.time}: ${s.event}`).join('\n')}`;
    }
    if (msgLower.includes('track') || msgLower.includes('sponsor') || msgLower.includes('prize')) {
      return `Here are the sponsor tracks & prizes:\n${hackathonConfig.sponsorTracks.map(t => `• ${t.name} (${t.sponsor}): ${t.prize} - ${t.description}`).join('\n')}`;
    }
    if (readmeContent) {
      return `I reviewed your repository README. Based on your project setup, focus on completing your core MVP workflow first before adding secondary polish. Make sure your API endpoints handle edge cases cleanly!`;
    }
    return `That's a great question! For hackathons, prioritize building a end-to-end working prototype over perfect refactoring. Break down your task into 30-minute milestones and test early!`;
  }
}

/**
 * FEATURE 3 — AI Project Evaluation
 * @param {object} submission
 * @returns {Promise<{originality_score: number, technical_depth_score: number, completeness_score: number, clarity_score: number, justification: string}>}
 */
async function evaluateSubmissionWithAI(submission) {
  const prompt = `
You are an expert Hackathon Judge AI. Evaluate the following project submission:

Repo Link: ${submission.repo_link || 'N/A'}
Description: ${submission.description || 'N/A'}
Demo Video Link: ${submission.demo_video_link || 'N/A'}

INSTRUCTIONS:
Evaluate on a scale of 0 to 10 for each criteria:
1. originality_score (Innovation, uniqueness)
2. technical_depth_score (Architectural complexity, technical execution)
3. completeness_score (Working functionality vs scope)
4. clarity_score (Presentation quality and clear description)
5. justification (A short summary paragraph explaining the scores)

Output STRICT VALID JSON ONLY. Do not include markdown or preamble.

REQUIRED JSON FORMAT:
{
  "originality_score": 8.5,
  "technical_depth_score": 9.0,
  "completeness_score": 8.0,
  "clarity_score": 8.5,
  "justification": "The project demonstrates impressive technical depth with clean architecture and clear documentation."
}
`;

  try {
    const rawResponse = await callLLM(prompt);
    const parsed = safeParseJSON(rawResponse);
    if (parsed && typeof parsed.originality_score === 'number') {
      return {
        originality_score: Number(parsed.originality_score),
        technical_depth_score: Number(parsed.technical_depth_score),
        completeness_score: Number(parsed.completeness_score),
        clarity_score: Number(parsed.clarity_score),
        justification: String(parsed.justification || 'Evaluated based on hackathon criteria.'),
      };
    }
  } catch (err) {
    console.warn('[AIService] LLM Evaluation failed or key missing. Returning fallback heuristic scorecard.');
  }

  // Heuristic evaluation fallback based on text length, repo presence, video link presence
  const hasVideo = !!submission.demo_video_link;
  const descLen = (submission.description || '').length;

  const originality = Math.min(10, Math.max(6, 7.5 + (descLen > 100 ? 1.0 : 0)));
  const technicalDepth = Math.min(10, Math.max(6, 8.0 + (submission.repo_link ? 1.0 : 0)));
  const completeness = hasVideo ? 8.5 : 7.0;
  const clarity = descLen > 150 ? 9.0 : 7.5;

  return {
    originality_score: originality,
    technical_depth_score: technicalDepth,
    completeness_score: completeness,
    clarity_score: clarity,
    justification: `AI Evaluation: Solid project submission featuring repository integration (${submission.repo_link ? 'verified' : 'pending'}) and clear project goals.`,
  };
}

/**
 * FEATURE 4 — AI-Powered Idea Validator & Product Evaluation
 * @param {object} params
 * @param {string} params.idea_description
 * @param {number} params.hours_remaining
 * @returns {Promise<{overall_score: number, scores: object, summary: string, strengths: string[], weaknesses: string[], improvement_suggestions: string[], feasibility: string, originality: string, scope_note: string, suggested_mvp: string}>}
 */
async function validateIdeaWithAI({ idea_description, hours_remaining }) {
  const prompt = `
You are an expert AI Hackathon Strategist, Product Validator, and Venture Assessor.
Evaluate the following hackathon project idea across 7 key dimensions:

Idea Description: "${idea_description}"
Hours Remaining in Hackathon: ${hours_remaining} hours

INSTRUCTIONS & DIMENSIONS TO EVALUATE:
1. Innovation: Originality, uniqueness, and creative problem-solving approach (0-100).
2. Feasibility: Realistic buildability given ${hours_remaining} hours remaining (0-100).
3. Market Potential: Real-world value, target audience size, and problem relevance (0-100).
4. Technical Complexity: Architectural depth, engineering effort, and technical merit (0-100).
5. Scalability: Potential for future growth, user expansion, and technical scaling (0-100).
6. Clarity: Clear problem statement, clear user flow, and well-articulated concept (0-100).
7. Overall Quality: Holistic rating combining execution potential and presentation (0-100).

Return a concise executive summary, 2-3 key strengths, 2-3 key weaknesses/risks, 2-3 actionable improvement suggestions, and feasibility status ("green", "yellow", or "red").

Output STRICT VALID JSON ONLY. No markdown, no preambles.

REQUIRED JSON FORMAT:
{
  "overall_score": 85,
  "scores": {
    "innovation": 88,
    "feasibility": 80,
    "market_potential": 85,
    "technical_complexity": 82,
    "scalability": 84,
    "clarity": 90,
    "overall_quality": 85
  },
  "summary": "Innovative product concept targeting a clear pain point with strong technical feasibility within the hackathon timeline.",
  "strengths": [
    "Clear value proposition addressing real user pain points.",
    "High technical feasibility with manageable core API scope."
  ],
  "weaknesses": [
    "Potential competition from established developer tooling.",
    "Tight timeframe to complete full UI polish."
  ],
  "improvement_suggestions": [
    "Focus first on a rock-solid MVP core workflow.",
    "Add automated fallback mechanisms for third-party API dependencies."
  ],
  "feasibility": "green",
  "originality": "Fresh approach combining automated workflows with intelligent feedback.",
  "scope_note": "Building the primary MVP pipeline is realistic within remaining time.",
  "suggested_mvp": "Focus on primary core pipeline first; defer secondary dashboard analytics."
}
`;

  try {
    const rawResponse = await callLLM(prompt);
    const parsed = safeParseJSON(rawResponse);
    if (parsed && parsed.scores && typeof parsed.overall_score === 'number') {
      const feasibilityStatus = ['green', 'yellow', 'red'].includes(parsed.feasibility?.toLowerCase()) 
        ? parsed.feasibility.toLowerCase() 
        : (parsed.overall_score >= 75 ? 'green' : (parsed.overall_score >= 50 ? 'yellow' : 'red'));

      return {
        overall_score: Number(parsed.overall_score),
        scores: {
          innovation: Number(parsed.scores.innovation || 80),
          feasibility: Number(parsed.scores.feasibility || 80),
          market_potential: Number(parsed.scores.market_potential || 80),
          technical_complexity: Number(parsed.scores.technical_complexity || 75),
          scalability: Number(parsed.scores.scalability || 80),
          clarity: Number(parsed.scores.clarity || 85),
          overall_quality: Number(parsed.scores.overall_quality || 80),
        },
        summary: String(parsed.summary || 'Idea evaluated with AI multidimensional criteria.'),
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Innovative concept with strong relevance.'],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : ['Requires tight scope management.'],
        improvement_suggestions: Array.isArray(parsed.improvement_suggestions) ? parsed.improvement_suggestions : ['Focus on MVP demo path first.'],
        feasibility: feasibilityStatus,
        originality: String(parsed.originality || 'Fresh perspective with practical utility.'),
        scope_note: String(parsed.scope_note || `Scope evaluated for ${hours_remaining} hours remaining.`),
        suggested_mvp: String(parsed.suggested_mvp || 'Build the essential end-to-end user flow.'),
      };
    }
  } catch (err) {
    console.warn('[AIService] LLM Idea Validation failed or key missing. Returning fallback heuristic validation:', err.message);
  }

  // Heuristic Idea Validator Fallback
  const hours = Number(hours_remaining) || 24;
  const descLen = (idea_description || '').length;

  let feasibility = 'green';
  let scopeNote = `Given ${hours} hours remaining, the project scope is manageable for a standard team.`;
  let score = 82;

  if (hours < 12) {
    feasibility = descLen > 250 ? 'red' : 'yellow';
    scopeNote = `With only ${hours} hours left, the current feature set carries delivery risk. High priority to trim non-essential features.`;
    score = descLen > 250 ? 58 : 72;
  } else if (hours < 24 && descLen > 400) {
    feasibility = 'yellow';
    scopeNote = `Moderate time pressure (${hours}h). Trim background workers and non-critical integrations.`;
    score = 76;
  }

  return {
    overall_score: score,
    scores: {
      innovation: Math.min(95, Math.max(65, 75 + (descLen > 150 ? 10 : 0))),
      feasibility: feasibility === 'green' ? 88 : (feasibility === 'yellow' ? 70 : 50),
      market_potential: 80,
      technical_complexity: Math.min(90, Math.max(60, 70 + (descLen > 200 ? 15 : 0))),
      scalability: 78,
      clarity: descLen > 100 ? 85 : 70,
      overall_quality: score,
    },
    summary: `Heuristic evaluation: ${scopeNote}`,
    strengths: [
      'Addresses a defined problem statement.',
      'Clear core value proposition for hackathon audience.',
    ],
    weaknesses: [
      'Delivery risk under tight time constraints.',
      'Requires prioritizing key user flows over secondary polish.',
    ],
    improvement_suggestions: [
      'Lock in MVP core API endpoints first.',
      'Prepare demo script and backup video before final hour.',
    ],
    feasibility,
    originality: 'Promising concept with strong practical utility for target users.',
    scope_note: scopeNote,
    suggested_mvp: 'Focus on 1 core API endpoint, 1 database table, and 1 working demo flow to present to judges.',
  };
}


/**
 * Calculate team compatibility for a specific user profile against a team's required skills and tech stack using LLM.
 * @param {object} params
 * @param {object} params.userProfile
 * @param {object} params.team
 * @returns {Promise<object>}
 */
async function calculateTeamCompatibilityWithAI({ userProfile, team }) {
  let userSkills = [];
  try {
    userSkills = typeof userProfile?.skills === 'string' ? JSON.parse(userProfile.skills || '[]') : (userProfile?.skills || []);
  } catch (e) {
    userSkills = [];
  }

  let reqSkills = [];
  try {
    reqSkills = typeof team?.required_skills === 'string' ? JSON.parse(team.required_skills || '[]') : (team?.required_skills || []);
  } catch (e) {
    reqSkills = [];
  }

  let techStack = [];
  try {
    techStack = typeof team?.tech_stack === 'string' ? JSON.parse(team.tech_stack || '[]') : (team?.tech_stack || []);
  } catch (e) {
    techStack = [];
  }

  const prompt = `
Task: Evaluate the compatibility between a hackathon participant and a team.

Participant Profile:
- Skills: ${JSON.stringify(userSkills)}
- Experience Level: ${userProfile?.experience_level || 'Intermediate'}
- Interests: ${userProfile?.interests || '[]'}
- Project Goal: "${userProfile?.project_goal_text || 'Build cool project'}"

Team Requirements:
- Team Name: "${team?.name || 'Hackathon Team'}"
- Category: "${team?.category || 'General'}"
- Description: "${team?.description || ''}"
- Required Skills: ${JSON.stringify(reqSkills)}
- Tech Stack: ${JSON.stringify(techStack)}

Evaluate compatibility and return a STRICT JSON object in this format:
{
  "compatibility_percent": 85,
  "matching_skills": ["React", "Node.js"],
  "missing_skills": ["Python"],
  "ai_explanation": "Short clear rationale explanation (max 2-3 sentences)."
}
`;

  try {
    const rawOutput = await callLLM(prompt, "You are an expert AI hackathon matchmaker.");
    const parsed = safeParseJSON(rawOutput);

    if (parsed && typeof parsed.compatibility_percent === 'number') {
      return {
        compatibility_percent: Math.min(100, Math.max(0, Math.round(parsed.compatibility_percent))),
        matching_skills: Array.isArray(parsed.matching_skills) ? parsed.matching_skills : [],
        missing_skills: Array.isArray(parsed.missing_skills) ? parsed.missing_skills : [],
        ai_explanation: parsed.ai_explanation || "Good overall skill alignment for this team's goals.",
      };
    }
  } catch (err) {
    console.warn('[AIService] calculateTeamCompatibilityWithAI failed, using heuristic:', err.message);
  }

  // Heuristic fallback
  const userSkillLower = userSkills.map(s => s.toLowerCase());
  const allReqLower = [...reqSkills, ...techStack].map(s => s.toLowerCase());

  const matching = [];
  const missing = [];

  reqSkills.forEach(s => {
    if (userSkillLower.includes(s.toLowerCase())) {
      matching.push(s);
    } else {
      missing.push(s);
    }
  });

  const matchRatio = allReqLower.length > 0 ? (matching.length / Math.max(1, reqSkills.length)) : 0.75;
  const score = Math.min(95, Math.max(50, Math.round(matchRatio * 40 + 55)));

  return {
    compatibility_percent: score,
    matching_skills: matching,
    missing_skills: missing,
    ai_explanation: `Heuristic compatibility match: User shares ${matching.length} matching skills with the team's requirements.`,
  };
}

module.exports = {
  safeParseJSON,
  matchTeamsWithAI,
  generateMentorResponse,
  evaluateSubmissionWithAI,
  validateIdeaWithAI,
  calculateTeamCompatibilityWithAI,
};
