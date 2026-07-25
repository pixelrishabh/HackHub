const prisma = require('../config/db');

const createNotification = async (userId, type, title, message) => {
  try {
    return await prisma.notification.create({
      data: {
        user_id: userId,
        type,
        title,
        message,
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

const getUserNotifications = async (userId) => {
  try {
    return await prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

const markAsRead = async (notificationId, userId) => {
  try {
    return await prisma.notification.updateMany({
      where: {
        id: notificationId,
        user_id: userId,
      },
      data: { is_read: true },
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

const markAllAsRead = async (userId) => {
  try {
    return await prisma.notification.updateMany({
      where: { user_id: userId },
      data: { is_read: true },
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
};
