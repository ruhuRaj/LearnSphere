import { ForumThread } from '../models/Extra.js';
import { FlaggedComment } from '../models/Other.js';
import axios from 'axios';

const AI_URL = process.env.AI_SERVICE_URL || process.env.AI_URL || 'http://localhost:8000';

const normalizeModeration = (mod) => {
  if (!mod || typeof mod !== 'object') return undefined;
  return {
    flagged: Boolean(mod.flagged || mod.isFlagged || mod.flagged === true),
    isSpam: Boolean(mod.isSpam ?? mod.is_spam ?? mod.spam === true),
    isToxic: Boolean(mod.isToxic ?? mod.is_toxic ?? mod.toxic === true),
    toxicityScore: Number(mod.toxicityScore ?? mod.toxicity_score ?? 0) || 0,
    spamScore: Number(mod.spamScore ?? mod.spam_score ?? 0) || 0,
    reviewedByAdmin: Boolean(mod.reviewedByAdmin ?? mod.reviewed_by_admin ?? false),
  };
};

const normalizeThread = (thread, currentUser = null) => {
  const safeThread = thread.toObject ? thread.toObject() : thread;

  const isAdmin = currentUser && currentUser.role === 'admin';
  const currentUserId = currentUser?._id ? String(currentUser._id) : currentUser?._id || null;

  const visibleReplies = (safeThread.replies || []).filter((reply) => {
    if (!reply) return false;
    if (!reply.status || reply.status !== 'pending_review') return true;
    // show pending review replies only to the reply author and admins
    const authorId = reply.author?._id || reply.author;
    if (!authorId) return isAdmin;
    if (String(authorId) === String(currentUserId)) return true;
    return isAdmin;
  }).map((reply) => ({
    ...reply,
    author: reply.author
      ? {
          _id: reply.author._id || reply.author,
          name: reply.author.name || 'Unknown user',
          avatar: reply.author.avatar || '',
        }
      : null,
    upvotesCount: Array.isArray(reply.upvotes) ? reply.upvotes.length : 0,
  }));

  // If the thread itself is pending_review, hide it from others unless admin or author
  const threadVisible = (safeThread.status !== 'pending_review') || isAdmin || (safeThread.author && String(safeThread.author._id || safeThread.author) === String(currentUserId));

  return threadVisible ? {
    ...safeThread,
    upvotesCount: Array.isArray(safeThread.upvotes) ? safeThread.upvotes.length : 0,
    author: safeThread.author
      ? {
          _id: safeThread.author._id || safeThread.author,
          name: safeThread.author.name || 'Anonymous learner',
          avatar: safeThread.author.avatar || '',
        }
      : { _id: null, name: 'Anonymous learner', avatar: '' },
    replies: visibleReplies,
  } : null;
};

export const getThreads = async (req, res) => {
  try {
    const { category = 'all', search = '', page = 1, limit = 20 } = req.query;

    const query = {};

    if (category && category !== 'all') query.category = category;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.max(1, Number(limit) || 20);

    const [threads, total] = await Promise.all([
      ForumThread.find(query)
        .populate('author', 'name avatar')
        .populate('replies.author', 'name avatar')
        .sort({ isPinned: -1, createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize),
      ForumThread.countDocuments(query),
    ]);

    res.json({
      success: true,
      threads: threads.map((t) => normalizeThread(t, req.user)).filter(Boolean),
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load forum threads', error: error.message });
  }
};

export const getThread = async (req, res) => {
  try {
    const thread = await ForumThread.findById(req.params.id)
      .populate('author', 'name avatar')
      .populate('replies.author', 'name avatar');

    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    thread.views = (thread.views || 0) + 1;
    await thread.save();

    res.json({ success: true, thread: normalizeThread(thread, req.user) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load thread', error: error.message });
  }
};

export const createThread = async (req, res) => {
  try {
    const { title, content, category = 'general', tags = [], course } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    // Moderate the thread content via AI service
    let moderation = null;
    let status = 'approved';
    try {
      const { data } = await axios.post(`${AI_URL}/ai/moderate-comment`, { text: content }, { timeout: 5000 });
      moderation = normalizeModeration(data?.moderation || data);
      if (moderation?.flagged) status = 'pending_review';
    } catch (err) {
      // fail open: default to approved
      moderation = null;
      status = 'approved';
    }

    const thread = await ForumThread.create({
      title,
      content,
      author: req.user?._id || null,
      course: course || undefined,
      category,
      tags: Array.isArray(tags) ? tags : String(tags || '').split(',').map((tag) => tag.trim()).filter(Boolean),
      isPinned: false,
      views: 0,
      upvotes: [],
      replies: [],
      status,
      moderation: moderation || undefined,
    });

    if (status === 'pending_review' && moderation) {
      // create flagged comment record for admin review
      await FlaggedComment.create({ sourceType: 'forum_reply', parentId: thread._id, text: content, author: req.user?._id || null, moderation });
    }

    await thread.populate('author', 'name avatar');

    const normalizedThread = normalizeThread(thread, req.user);
    const responseThread = normalizedThread || {
      ...thread.toObject(),
      upvotesCount: Array.isArray(thread.upvotes) ? thread.upvotes.length : 0,
      author: thread.author
        ? {
            _id: thread.author._id || thread.author,
            name: thread.author.name || 'Anonymous learner',
            avatar: thread.author.avatar || '',
          }
        : { _id: null, name: 'Anonymous learner', avatar: '' },
      replies: thread.replies || [],
    };

    res.status(201).json({ success: true, thread: responseThread });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create thread', error: error.message });
  }
};

export const addReply = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Reply content is required' });
    }

    const thread = await ForumThread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    // Moderate reply
    let moderation = null;
    let replyStatus = 'approved';
    try {
      const { data } = await axios.post(`${AI_URL}/ai/moderate-comment`, { text: content.trim() }, { timeout: 5000 });
      moderation = normalizeModeration(data?.moderation || data);
      if (moderation?.flagged) replyStatus = 'pending_review';
    } catch (err) {
      moderation = null;
      replyStatus = 'approved';
    }

    const newReply = {
      author: req.user?._id || null,
      content: content.trim(),
      upvotes: [],
      status: replyStatus,
      moderation: moderation || undefined,
      createdAt: new Date(),
    };

    thread.replies.push(newReply);

    if (replyStatus === 'pending_review' && moderation) {
      await FlaggedComment.create({ sourceType: 'forum_reply', parentId: thread._id, itemId: thread.replies[thread.replies.length - 1]._id, text: content.trim(), author: req.user?._id || null, moderation });
    }

    await thread.save();
    await thread.populate('author', 'name avatar');
    await thread.populate('replies.author', 'name avatar');

    res.json({ success: true, thread: normalizeThread(thread, req.user), addedReplyStatus: newReply.status });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add reply', error: error.message });
  }
};
