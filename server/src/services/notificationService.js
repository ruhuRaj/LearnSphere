/**
 * Notification Service — Create and manage notifications
 */
import { Notification } from '../models/Other.js';

// Create a notification
export const createNotification = async ({ userId, title, message, type = 'info', link }) => {
  const notification = await Notification.create({
    user: userId,
    title,
    message,
    type,
    link,
  });
  return notification;
};

// Create bulk notifications (e.g., for all students in a course)
export const createBulkNotifications = async (userIds, { title, message, type = 'info', link }) => {
  const notifications = userIds.map(userId => ({
    user: userId,
    title,
    message,
    type,
    link,
  }));
  return Notification.insertMany(notifications);
};

// Get user notifications with pagination
export const getUserNotifications = async (userId, { page = 1, limit = 20 } = {}) => {
  const total = await Notification.countDocuments({ user: userId });
  const unreadCount = await Notification.countDocuments({ user: userId, read: false });

  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return { notifications, total, unreadCount, totalPages: Math.ceil(total / limit) };
};

// Mark notifications as read
export const markAsRead = async (notificationIds, userId) => {
  return Notification.updateMany(
    { _id: { $in: notificationIds }, user: userId },
    { read: true }
  );
};

// Mark all as read
export const markAllAsRead = async (userId) => {
  return Notification.updateMany({ user: userId, read: false }, { read: true });
};

// Delete old notifications (cleanup — run via cron)
export const deleteOldNotifications = async (daysOld = 30) => {
  const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  return Notification.deleteMany({ createdAt: { $lt: cutoff }, read: true });
};

// Notification templates
export const NotificationTemplates = {
  courseEnrolled: (courseName) => ({
    title: 'Course Enrolled! 🎉',
    message: `You have successfully enrolled in "${courseName}". Start learning now!`,
    type: 'success',
  }),
  assignmentDue: (assignmentTitle, dueDate) => ({
    title: 'Assignment Due Soon ⏰',
    message: `"${assignmentTitle}" is due on ${new Date(dueDate).toLocaleDateString()}`,
    type: 'warning',
  }),
  testResult: (testTitle, score) => ({
    title: 'Test Result Available 📊',
    message: `Your score for "${testTitle}": ${score}%`,
    type: 'info',
  }),
  liveClassReminder: (className, time) => ({
    title: 'Live Class Starting 🔴',
    message: `"${className}" starts at ${time}. Don't miss it!`,
    type: 'info',
  }),
  xpEarned: (amount, reason) => ({
    title: `+${amount} XP Earned! 🌟`,
    message: reason,
    type: 'success',
  }),
  streakMilestone: (days) => ({
    title: `${days}-Day Streak! 🔥`,
    message: `Incredible! You've maintained a ${days}-day learning streak. Keep going!`,
    type: 'success',
  }),
  badgeEarned: (badgeName) => ({
    title: 'New Badge Unlocked! 🏅',
    message: `You earned the "${badgeName}" badge!`,
    type: 'success',
  }),
  courseCompleted: (courseName) => ({
    title: 'Course Completed! 🎓',
    message: `Congratulations! You completed "${courseName}". Your certificate is ready.`,
    type: 'success',
  }),
};
