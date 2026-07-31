const prisma = require('../config/db');

/**
 * FEATURE: Get Active Conversations (Teams & Direct Messages)
 * Endpoint: GET /api/chat/conversations
 */
async function getConversations(req, res) {
  try {
    const userId = req.user.id;
    const userRole = (req.user.role || '').toLowerCase();
    const isStaff = ['organizer', 'judge', 'mentor', 'sponsor'].includes(userRole);

    // 1. Fetch Team Channels for user
    const teams = await prisma.team.findMany({
      include: prisma.chatMessage ? {
        chat_messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      } : undefined,
    });

    const userTeams = teams.filter(t => {
      if (isStaff) return true;
      try {
        const ids = JSON.parse(t.member_ids || '[]');
        return ids.includes(userId);
      } catch (e) {
        return false;
      }
    });

    const teamChannels = await Promise.all(
      userTeams.map(async t => {
        let unreadCount = 0;
        if (prisma.chatMessage) {
          unreadCount = await prisma.chatMessage.count({
            where: {
              team_id: t.id,
              read_status: false,
              sender_id: { not: userId },
            },
          });
        }

        const lastMsg = t.chat_messages ? t.chat_messages[0] : null;

        return {
          id: t.id,
          type: 'TEAM',
          name: `${t.name} (Team Channel)`,
          primary_field: t.primary_field,
          unread_count: unreadCount,
          last_message: lastMsg ? lastMsg.content : 'No messages yet.',
          last_timestamp: lastMsg ? lastMsg.createdAt : t.createdAt,
        };
      })
    );

    // 2. Fetch Direct Message Contacts
    let dmChannels = [];
    if (prisma.chatMessage) {
      const dmMessages = await prisma.chatMessage.findMany({
        where: {
          OR: [
            { sender_id: userId, team_id: null },
            { receiver_id: userId, team_id: null },
          ],
        },
        include: {
          sender: { select: { id: true, name: true, email: true, role: true } },
          receiver: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const dmMap = new Map();

      for (const msg of dmMessages) {
        const otherUser = msg.sender_id === userId ? msg.receiver : msg.sender;
        if (!otherUser || dmMap.has(otherUser.id)) continue;

        const unreadCount = await prisma.chatMessage.count({
          where: {
            sender_id: otherUser.id,
            receiver_id: userId,
            read_status: false,
          },
        });

        dmMap.set(otherUser.id, {
          id: otherUser.id,
          type: 'DM',
          name: otherUser.name,
          email: otherUser.email,
          role: otherUser.role,
          unread_count: unreadCount,
          last_message: msg.content,
          last_timestamp: msg.createdAt,
        });
      }

      dmChannels = Array.from(dmMap.values());
    }

    return res.status(200).json({
      team_channels: teamChannels,
      direct_messages: dmChannels,
    });
  } catch (error) {
    console.error('[ChatController] getConversations Error:', error);
    return res.status(500).json({ error: 'Failed to fetch conversations.' });
  }
}

/**
 * FEATURE: Get Message History for User or Team
 * Endpoint: GET /api/chat/messages/:targetId
 */
async function getMessages(req, res) {
  try {
    const userId = req.user.id;
    const { targetId } = req.params;

    if (!prisma.chatMessage) {
      return res.status(200).json({ messages: [] });
    }

    const team = await prisma.team.findUnique({ where: { id: targetId } });

    let messages = [];

    if (team) {
      messages = await prisma.chatMessage.findMany({
        where: { team_id: targetId },
        include: {
          sender: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'asc' },
      });
    } else {
      messages = await prisma.chatMessage.findMany({
        where: {
          OR: [
            { sender_id: userId, receiver_id: targetId },
            { sender_id: targetId, receiver_id: userId },
          ],
        },
        include: {
          sender: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'asc' },
      });
    }

    return res.status(200).json({ messages });
  } catch (error) {
    console.error('[ChatController] getMessages Error:', error);
    return res.status(500).json({ error: 'Failed to fetch messages.' });
  }
}

/**
 * FEATURE: Send Chat Message (DM or Team Channel)
 * Endpoint: POST /api/chat/send
 */
async function sendMessage(req, res) {
  try {
    const senderId = req.user.id;
    const { receiver_id, team_id, content } = req.body;

    if (!content || (!receiver_id && !team_id)) {
      return res.status(400).json({ error: 'Message content and either receiver_id or team_id are required.' });
    }

    if (!prisma.chatMessage) {
      const mockMsg = {
        id: `msg-${Date.now()}`,
        sender_id: senderId,
        receiver_id: receiver_id || null,
        team_id: team_id || null,
        content,
        createdAt: new Date().toISOString(),
        sender: { id: senderId, name: req.user.name || 'User', role: req.user.role || 'participant' },
      };
      return res.status(201).json({ message: mockMsg });
    }

    const message = await prisma.chatMessage.create({
      data: {
        sender_id: senderId,
        receiver_id: receiver_id || null,
        team_id: team_id || null,
        content,
        read_status: false,
      },
      include: {
        sender: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (team_id && prisma.engagementEvent) {
      try {
        await prisma.engagementEvent.create({
          data: {
            team_id: team_id,
            user_id: senderId,
            event_type: 'chat_message',
          },
        });
      } catch (e) {}
    }

    return res.status(201).json({ message });
  } catch (error) {
    console.error('[ChatController] sendMessage Error:', error);
    return res.status(500).json({ error: 'Failed to send message.' });
  }
}

/**
 * FEATURE: Mark Conversation Messages as Read
 * Endpoint: PATCH /api/chat/read/:targetId
 */
async function markAsRead(req, res) {
  try {
    const userId = req.user.id;
    const { targetId } = req.params;

    if (!prisma.chatMessage) {
      return res.status(200).json({ message: 'Messages marked as read.' });
    }

    const team = await prisma.team.findUnique({ where: { id: targetId } });

    if (team) {
      await prisma.chatMessage.updateMany({
        where: {
          team_id: targetId,
          read_status: false,
          sender_id: { not: userId },
        },
        data: { read_status: true },
      });
    } else {
      await prisma.chatMessage.updateMany({
        where: {
          sender_id: targetId,
          receiver_id: userId,
          read_status: false,
        },
        data: { read_status: true },
      });
    }

    return res.status(200).json({ message: 'Messages marked as read.' });
  } catch (error) {
    console.error('[ChatController] markAsRead Error:', error);
    return res.status(500).json({ error: 'Failed to update read status.' });
  }
}

/**
 * FEATURE: AI Smart Match Connection Suggestions
 * Endpoint: GET /api/chat/suggested-connections
 */
async function getSuggestedConnections(req, res) {
  try {
    const userId = req.user.id;
    const userProfile = await prisma.profile.findUnique({ where: { user_id: userId } });

    let mySkills = [];
    try { mySkills = JSON.parse(userProfile?.skills || '[]'); } catch (e) {}

    const candidates = await prisma.user.findMany({
      where: { id: { not: userId } },
      include: { profile: true },
      take: 20,
    });

    const suggestions = candidates.map(c => {
      let candidateSkills = [];
      try { candidateSkills = JSON.parse(c.profile?.skills || '[]'); } catch (e) {}

      const sharedSkills = mySkills.filter(s => candidateSkills.includes(s));
      let matchReason = `Compatible ${c.role.toUpperCase()} in ${c.profile?.primary_field || 'AI'}`;
      if (sharedSkills.length > 0) {
        matchReason = `Shared skills: ${sharedSkills.join(', ')}`;
      }

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        role: c.role,
        primary_field: c.profile?.primary_field || 'AI/ML',
        skills: candidateSkills,
        match_reason: matchReason,
      };
    });

    suggestions.sort((a, b) => {
      const priority = { mentor: 3, sponsor: 2, organizer: 1, participant: 0 };
      return (priority[b.role.toLowerCase()] || 0) - (priority[a.role.toLowerCase()] || 0);
    });

    return res.status(200).json({ suggestions: suggestions.slice(0, 6) });
  } catch (error) {
    console.error('[ChatController] getSuggestedConnections Error:', error);
    return res.status(500).json({ error: 'Failed to generate connection suggestions.' });
  }
}

/**
 * FEATURE: AI Smart Icebreaker Intro Generator
 * Endpoint: POST /api/chat/ai-intro
 */
async function generateAIIntro(req, res) {
  try {
    const senderId = req.user.id;
    const { target_user_id } = req.body;

    const senderUser = await prisma.user.findUnique({ where: { id: senderId }, include: { profile: true } });
    const targetUser = await prisma.user.findUnique({ where: { id: target_user_id }, include: { profile: true } });

    if (!targetUser) {
      return res.status(404).json({ error: 'Target connection user not found.' });
    }

    let senderSkills = [];
    try { senderSkills = JSON.parse(senderUser.profile?.skills || '[]'); } catch (e) {}

    let targetSkills = [];
    try { targetSkills = JSON.parse(targetUser.profile?.skills || '[]'); } catch (e) {}

    const overlap = senderSkills.filter(s => targetSkills.includes(s));

    const icebreaker = `Hi ${targetUser.name}! I noticed your background in ${targetUser.profile?.primary_field || 'tech'}${overlap.length > 0 ? ` and shared experience in ${overlap.join(', ')}` : ''}. I'd love to connect, exchange ideas, and collaborate during the hackathon!`;

    return res.status(200).json({
      icebreaker,
      target_user_id,
      target_name: targetUser.name,
    });
  } catch (error) {
    console.error('[ChatController] generateAIIntro Error:', error);
    return res.status(500).json({ error: 'Failed to generate AI icebreaker.' });
  }
}

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getSuggestedConnections,
  generateAIIntro,
};
