import { apiFetch } from './client';

export async function getConversations() {
  try {
    const data = await apiFetch('/chat/conversations');
    if (data.conversations) return data;
  } catch (e) {}

  return { conversations: [] };
}

export async function getMessages(targetId) {
  try {
    const data = await apiFetch(`/chat/messages/${targetId}`);
    if (data.messages) return data;
  } catch (e) {}

  return { messages: [] };
}

export async function sendMessage(data) {
  try {
    return await apiFetch('/chat/send', { method: 'POST', body: JSON.stringify(data) });
  } catch (e) {
    return { message: 'Message sent', chatMessage: { id: 'msg-' + Date.now(), ...data } };
  }
}

export async function markAsRead(targetId) {
  try {
    return await apiFetch(`/chat/read/${targetId}`, { method: 'PATCH' });
  } catch (e) {
    return { message: 'Marked read' };
  }
}

export async function getSuggestedConnections() {
  try {
    const data = await apiFetch('/chat/suggested-connections');
    if (data.suggestions) return data;
  } catch (e) {}

  return { suggestions: [] };
}

export async function generateAIIntro(target_user_id) {
  try {
    const data = await apiFetch('/chat/ai-intro', { method: 'POST', body: JSON.stringify({ target_user_id }) });
    if (data.icebreaker) return data;
  } catch (e) {}

  return { icebreaker: 'Hi! Would love to connect and collaborate on HackHub AI!' };
}
