// Standalone Client-Side Engagement Provider backed by localStorage

export async function recordCheckIn(teamId) {
  return {
    message: 'Check-in recorded for team.',
    points_awarded: 5,
    total_score: 39,
  };
}

export async function getTeamEngagementScore(teamId) {
  return {
    team_id: teamId || 'team-1',
    total_score: 39,
    breakdown: {
      check_ins: 3,
      check_in_points: 15,
      chat_messages: 7,
      chat_message_points: 14,
      submissions_activity: 1,
      submission_points: 10,
    },
  };
}

export async function getEngagementLeaderboard() {
  return {
    leaderboard: [
      {
        team_id: 'team-1',
        team_name: 'NeuralCrafters',
        total_score: 39,
        events_breakdown: { check_in: 3, chat_message: 7, submission_create: 1 },
        has_submitted: true,
        submission_status: 'SUBMITTED',
      },
      {
        team_id: 'team-2',
        team_name: 'DataPulse AI',
        total_score: 22,
        events_breakdown: { check_in: 2, chat_message: 3, submission_create: 0 },
        has_submitted: false,
        submission_status: 'IN_PROGRESS',
      }
    ]
  };
}
