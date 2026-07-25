import { apiFetch } from './client';

export async function validateIdea({ idea_description, hours_remaining = 24 }) {
  return apiFetch('/ideas/validate', {
    method: 'POST',
    body: JSON.stringify({
      idea_description,
      hours_remaining: Number(hours_remaining),
    }),
  });
}
