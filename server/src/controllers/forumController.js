import { ForumThread } from '../models/Extra.js';

const normalizeThread = (thread) => {
  const safeThread = thread.toObject ? thread.toObject() : thread;

  return {
    ...safeThread,
    upvotesCount: Array.isArray(safeThread.upvotes) ? safeThread.upvotes.length : 0,
    author: safeThread.author
      ? {
          _id: safeThread.author._id || safeThread.author,
          name: safeThread.author.name || 'Anonymous learner',
          avatar: safeThread.author.avatar || '',
        }
      : { _id: null, name: 'Anonymous learner', avatar: '' },
    replies: (safeThread.replies || []).map((reply) => ({
      ...reply,
      author: reply.author
        ? {
            _id: reply.author._id || reply.author,
            name: reply.author.name || 'Unknown user',
            avatar: reply.author.avatar || '',
          }
        : null,
      upvotesCount: Array.isArray(reply.upvotes) ? reply.upvotes.length : 0,
    })),
  };
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
      threads: threads.map(normalizeThread),
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

    res.json({ success: true, thread: normalizeThread(thread) });
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
    });

    await thread.populate('author', 'name avatar');

    res.status(201).json({ success: true, thread: normalizeThread(thread) });
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

    thread.replies.push({
      author: req.user?._id || null,
      content: content.trim(),
      upvotes: [],
      isModerated: false,
      createdAt: new Date(),
    });

    await thread.save();
    await thread.populate('author', 'name avatar');
    await thread.populate('replies.author', 'name avatar');

    res.json({ success: true, thread: normalizeThread(thread) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add reply', error: error.message });
  }
};
