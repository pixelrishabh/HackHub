import { apiFetch } from './client';

export async function getConversations() {
  return apiFetch('/chat/conversations', {
    method: 'GET',
  });
}

export async function getMessages(targetId) {
  return apiFetch(`/chat/messages/${targetId}`, {
    method: 'GET',
  });
}

export async function sendMessage(data) {
  return apiFetch('/chat/send', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function markAsRead(targetId) {
  return apiFetch(`/chat/read/${targetId}`, {
    method: 'PATCH',
  });
}

export async function getSuggestedConnections() {
  return apiFetch('/chat/suggested-connections', {
    method: 'GET',
  });
}

export async function generateAIIntro(target_user_id) {
  return apiFetch('/chat/ai-intro', {
    method: 'POST',
    body: JSON.stringify({ target_user_id }),
  });
}
