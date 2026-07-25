import { apiFetch } from './client';

export async function createOrUpdateSubmission(data) {
  return apiFetch('/submissions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getAllSubmissions() {
  return apiFetch('/submissions', {
    method: 'GET',
  });
}

export async function evaluateSubmission(id, data = {}) {
  return apiFetch(`/submissions/${id}/evaluate`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getSubmissionEvaluation(id) {
  return apiFetch(`/submissions/${id}/evaluation`, {
    method: 'GET',
  });
}

export async function updateJudgeManualScore(id, judge_manual_score) {
  return apiFetch(`/submissions/${id}/manual-score`, {
    method: 'PATCH',
    body: JSON.stringify({ judge_manual_score: Number(judge_manual_score) }),
  });
}

export async function checkSimilarity(threshold = 0.85) {
  return apiFetch('/submissions/check-similarity', {
    method: 'POST',
    body: JSON.stringify({ threshold: Number(threshold) }),
  });
}

export async function getSimilarityFlags() {
  return apiFetch('/submissions/similarity-flags', {
    method: 'GET',
  });
}
