const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const Profile = require('../models/Profile');

async function getConversations(req, res) {
  try {
    const userId = req.user._id;
    const messages = await ChatMessage.find({
      $or: [{ senderId: userId }, { targetId: userId }],
    }).sort({ createdAt: -1 });

    const conversationMap = {};
    for (const msg of messages) {
      const otherId = msg.senderId.toString() === userId.toString() ? msg.targetId.toString() : msg.senderId.toString();
      if (!conversationMap[otherId]) {
        const otherUser = await User.findById(otherId).select('name email role');
        const otherProfile = await Profile.findOne({ userId: otherId });
        conversationMap[otherId] = {
          user_id: otherId,
          name: otherUser ? otherUser.name : 'Participant',
          email: otherUser ? otherUser.email : '',
          role: otherUser ? otherUser.role : 'participant',
          avatar_url: otherProfile ? otherProfile.avatarUrl : '',
          last_message: msg.message,
          last_message_time: msg.createdAt,
          unread_count: msg.targetId.toString() === userId.toString() && !msg.isRead ? 1 : 0,
        };
      }
    }

    const conversations = Object.values(conversationMap);
    return res.status(200).json({ conversations });
  } catch (error) {
    console.error('[ChatController] getConversations Error:', error);
    return res.status(500).json({ error: 'Failed to fetch conversations.' });
  }
}

async function getMessages(req, res) {
  try {
    const userId = req.user._id;
    const { targetId } = req.params;

    const messages = await ChatMessage.find({
      $or: [
        { senderId: userId, targetId },
        { senderId: targetId, targetId: userId },
      ],
    }).sort({ createdAt: 1 });

    const formattedMessages = messages.map((m) => m.toJSON());
    return res.status(200).json({ messages: formattedMessages });
  } catch (error) {
    console.error('[ChatController] getMessages Error:', error);
    return res.status(500).json({ error: 'Failed to fetch direct messages.' });
  }
}

async function sendMessage(req, res) {
  try {
    const userId = req.user._id;
    const { targetId, target_id, message } = req.body;
    const recipientId = targetId || target_id;

    if (!recipientId || !message) {
      return res.status(400).json({ error: 'Target ID and message content are required.' });
    }

    const newMsg = await ChatMessage.create({
      senderId: userId,
      targetId: recipientId,
      message,
    });

    return res.status(201).json({
      message: 'Direct message sent successfully.',
      chatMessage: newMsg.toJSON(),
    });
  } catch (error) {
    console.error('[ChatController] sendMessage Error:', error);
    return res.status(500).json({ error: 'Failed to send message.' });
  }
}

async function markRead(req, res) {
  try {
    const userId = req.user._id;
    const { targetId } = req.params;

    await ChatMessage.updateMany({ senderId: targetId, targetId: userId, isRead: false }, { isRead: true });

    return res.status(200).json({ message: 'Conversation marked as read.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to mark read.' });
  }
}

async function getSuggestedConnections(req, res) {
  try {
    const userId = req.user._id;
    const otherUsers = await User.find({ _id: { $ne: userId } }).limit(5);

    const suggestions = await Promise.all(
      otherUsers.map(async (u) => {
        const p = await Profile.findOne({ userId: u._id });
        return {
          user_id: u._id.toString(),
          name: u.name,
          email: u.email,
          role: u.role,
          avatar_url: p ? p.avatarUrl : '',
          skills: p ? p.skills : ['AI', 'React'],
          match_score: 92,
          reason: 'Shared interest in AI Agents & MERN Stack development.',
        };
      })
    );

    return res.status(200).json({ suggestions });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch suggested connections.' });
  }
}

async function generateAIIntro(req, res) {
  try {
    const { target_user_id, targetId } = req.body;
    const target = await User.findById(target_user_id || targetId);

    const targetName = target ? target.name : 'Fellow Developer';
    const introMessage = `Hi ${targetName}! I noticed your work on AI Agents and HackHub AI project. Would love to collaborate on technical ideas or team building!`;

    return res.status(200).json({
      message: 'AI intro icebreaker generated successfully.',
      icebreaker: introMessage,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate AI intro.' });
  }
}

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markRead,
  getSuggestedConnections,
  generateAIIntro,
};
