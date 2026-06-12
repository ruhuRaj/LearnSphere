/**
 * Gamification Service — XP, levels, streaks, badges, ranks
 */
import User from '../models/User.js';
import { createNotification, NotificationTemplates } from './notificationService.js';

// ── XP Rewards Table ────────────────────────
const XP_REWARDS = {
  LOGIN_DAILY: 10,
  COMPLETE_VIDEO: 15,
  COMPLETE_CHAPTER: 50,
  COMPLETE_COURSE: 200,
  SUBMIT_ASSIGNMENT: 20,
  PASS_TEST: 30,
  PERFECT_SCORE: 100,
  ASK_DOUBT: 5,
  ANSWER_DOUBT: 15,
  ATTEND_LIVE_CLASS: 25,
  FORUM_POST: 10,
  FORUM_UPVOTE_RECEIVED: 2,
  STREAK_7_DAYS: 50,
  STREAK_30_DAYS: 200,
  STREAK_100_DAYS: 1000,
};

// ── Level Thresholds ────────────────────────
const getLevelFromXP = (xp) => {
  if (xp < 100) return 1;
  if (xp < 300) return 2;
  if (xp < 600) return 3;
  if (xp < 1000) return 4;
  if (xp < 1500) return 5;
  if (xp < 2200) return 6;
  if (xp < 3000) return 7;
  if (xp < 4000) return 8;
  if (xp < 5200) return 9;
  if (xp < 6500) return 10;
  if (xp < 8000) return 11;
  if (xp < 10000) return 12;
  if (xp < 12500) return 13;
  if (xp < 15500) return 14;
  if (xp < 19000) return 15;
  if (xp < 23000) return 16;
  if (xp < 28000) return 17;
  if (xp < 34000) return 18;
  if (xp < 41000) return 19;
  return 20;
};

// ── Rank Tiers ──────────────────────────────
const getRankFromLevel = (level) => {
  if (level <= 3) return { name: 'Bronze', color: '#CD7F32', icon: '🥉' };
  if (level <= 6) return { name: 'Silver', color: '#C0C0C0', icon: '🥈' };
  if (level <= 9) return { name: 'Gold', color: '#FFD700', icon: '🥇' };
  if (level <= 12) return { name: 'Platinum', color: '#E5E4E2', icon: '💎' };
  if (level <= 15) return { name: 'Diamond', color: '#B9F2FF', icon: '💠' };
  if (level <= 18) return { name: 'Master', color: '#9B59B6', icon: '👑' };
  return { name: 'Grandmaster', color: '#E74C3C', icon: '🏆' };
};

// ── Award XP ────────────────────────────────
export const awardXP = async (userId, action, metadata = {}) => {
  const xpAmount = XP_REWARDS[action];
  if (!xpAmount) return null;

  const user = await User.findById(userId);
  if (!user) return null;

  const oldLevel = getLevelFromXP(user.xp);
  user.xp += xpAmount;
  const newLevel = getLevelFromXP(user.xp);
  user.level = newLevel;

  // Level up notification
  if (newLevel > oldLevel) {
    const rank = getRankFromLevel(newLevel);
    await createNotification({
      userId,
      ...NotificationTemplates.xpEarned(xpAmount, `You reached Level ${newLevel}! Rank: ${rank.icon} ${rank.name}`),
    });
  }

  await user.save();

  return {
    xpAwarded: xpAmount,
    totalXP: user.xp,
    level: newLevel,
    leveledUp: newLevel > oldLevel,
    rank: getRankFromLevel(newLevel),
  };
};

// ── Update Streak ───────────────────────────
export const updateStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const today = new Date().toDateString();
  const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate).toDateString() : null;
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (lastLogin === today) return { streak: user.streak, changed: false };

  if (lastLogin === yesterday) {
    user.streak += 1;
  } else {
    user.streak = 1;
  }

  user.lastLoginDate = new Date();

  // Streak milestones
  const milestones = [7, 30, 100];
  for (const m of milestones) {
    if (user.streak === m) {
      await awardXP(userId, `STREAK_${m}_DAYS`);
      await createNotification({ userId, ...NotificationTemplates.streakMilestone(m) });
    }
  }

  await user.save();
  return { streak: user.streak, changed: true };
};

// ── Award Badge ─────────────────────────────
export const awardBadge = async (userId, badgeName, badgeIcon) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const alreadyHas = user.badges?.some(b => b.name === badgeName);
  if (alreadyHas) return { alreadyHad: true };

  user.badges.push({ name: badgeName, icon: badgeIcon, earnedAt: new Date() });
  await user.save();

  await createNotification({ userId, ...NotificationTemplates.badgeEarned(badgeName) });

  return { awarded: true, badge: { name: badgeName, icon: badgeIcon } };
};

// ── Get Leaderboard ─────────────────────────
export const getLeaderboard = async ({ limit = 20, targetExam } = {}) => {
  const query = {};
  if (targetExam) query.targetExam = targetExam;
  query.role = 'student';

  const users = await User.find(query)
    .select('name avatar xp level streak badges targetExam')
    .sort({ xp: -1 })
    .limit(Number(limit));

  return users.map((u, i) => ({
    rank: i + 1,
    user: u,
    tier: getRankFromLevel(u.level),
  }));
};

export { XP_REWARDS, getLevelFromXP, getRankFromLevel };
