// Standalone Client-Side Analytics Provider

export async function getAnalyticsSummary() {
  return {
    overview: {
      total_participants: 148,
      total_teams: 32,
      total_submissions: 24,
      completion_rate_percent: 75,
      active_sponsors: 4,
    },
    submissions_by_category: [
      { category: 'AI / Machine Learning', count: 12 },
      { category: 'Data & Analytics', count: 6 },
      { category: 'Developer Tools', count: 4 },
      { category: 'Web3 / Blockchain', count: 2 },
    ],
    recent_activity: [
      { type: 'submission', team: 'NeuralCrafters', time: '10 mins ago' },
      { type: 'check_in', team: 'DataPulse AI', time: '25 mins ago' },
    ]
  };
}

export async function getCertificates(userId) {
  return {
    certificates: [
      {
        id: 'cert-1',
        title: 'HackHub AI Championship Winner',
        issued_date: '2026-08-01',
        credential_url: 'https://hackhub.ai/verify/cert-1',
      }
    ]
  };
}
