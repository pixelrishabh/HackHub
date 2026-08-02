// Standalone Client-Side Submissions Provider backed by localStorage

const INITIAL_SUBMISSIONS = [
  {
    id: 'sub-1',
    team_id: 'team-1',
    team_name: 'NeuralCrafters',
    repo_link: 'https://github.com/neuralcrafters/hackops-agent',
    description: 'Autonomous AI hackathon management platform with Groq LLM & RAG.',
    demo_video_link: 'https://youtube.com/watch?v=demo',
    status: 'SUBMITTED',
    createdAt: new Date().toISOString(),
    evaluations: [
      {
        id: 'eval-1',
        overall_score: 9.1,
        originality_score: 9.3,
        technical_depth_score: 9.0,
        completeness_score: 8.8,
        clarity_score: 9.3,
        justification: 'Outstanding hackathon submission with strong AI agent architecture, instant response latency, and cohesive glassmorphism UI design.',
        evaluator_role: 'AI Judge Engine',
        createdAt: new Date().toISOString(),
      }
    ]
  }
];

function getStorageSubmissions() {
  try {
    const raw = localStorage.getItem('hackhub_submissions');
    if (!raw) {
      localStorage.setItem('hackhub_submissions', JSON.stringify(INITIAL_SUBMISSIONS));
      return INITIAL_SUBMISSIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_SUBMISSIONS;
  }
}

function saveStorageSubmissions(subs) {
  try {
    localStorage.setItem('hackhub_submissions', JSON.stringify(subs));
  } catch (e) {}
}

export async function createSubmission(subData) {
  const subs = getStorageSubmissions();
  const newSub = {
    id: 'sub-' + Date.now(),
    team_id: subData.team_id || 'team-1',
    repo_link: subData.repo_link || 'https://github.com/neuralcrafters/hackops-agent',
    description: subData.description || 'Hackathon project submission.',
    demo_video_link: subData.demo_video_link || '',
    status: 'SUBMITTED',
    createdAt: new Date().toISOString(),
    evaluations: [
      {
        id: 'eval-' + Date.now(),
        overall_score: 8.9,
        originality_score: 9.0,
        technical_depth_score: 8.8,
        completeness_score: 8.9,
        clarity_score: 9.0,
        justification: 'Strong implementation with clean user flows and solid MVP completion.',
        evaluator_role: 'AI Judge Engine',
        createdAt: new Date().toISOString(),
      }
    ]
  };

  subs.push(newSub);
  saveStorageSubmissions(subs);

  return {
    message: 'Submission created successfully',
    submission: newSub,
  };
}

export async function getSubmissionByTeam(teamId) {
  const subs = getStorageSubmissions();
  const sub = subs.find(s => s.team_id === teamId) || subs[0];
  return { submission: sub };
}

export async function evaluateSubmission(submissionId) {
  return {
    message: 'Project evaluated successfully by AI Scorecard Engine.',
    evaluation: {
      overall_score: 9.1,
      originality_score: 9.3,
      technical_depth_score: 9.0,
      completeness_score: 8.8,
      clarity_score: 9.3,
      justification: 'High impact project addressing hackathon management workflows with Groq LLM integration.',
    }
  };
}
