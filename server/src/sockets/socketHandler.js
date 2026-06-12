/**
 * Socket.io handler — manages real-time connections for:
 * - Live class chat
 * - Notifications
 * - Real-time doubt updates
 * - Online presence
 */

const onlineUsers = new Map();

export default function setupSockets(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ── User joins ─────────────────────────
    socket.on('user:join', ({ userId, role }) => {
      onlineUsers.set(userId, { socketId: socket.id, role, joinedAt: new Date() });
      socket.userId = userId;
      io.emit('users:online', onlineUsers.size);
    });

    // ── Live Class Room ─────────────────────
    socket.on('class:join', ({ classId, userId, name }) => {
      socket.join(`class:${classId}`);
      socket.to(`class:${classId}`).emit('class:user-joined', { userId, name });
    });

    socket.on('class:message', ({ classId, userId, name, text }) => {
      io.to(`class:${classId}`).emit('class:new-message', {
        id: Date.now(),
        userId,
        name,
        text,
        time: new Date().toISOString(),
      });
    });

    socket.on('class:raise-hand', ({ classId, userId, name }) => {
      io.to(`class:${classId}`).emit('class:hand-raised', { userId, name });
    });

    socket.on('class:leave', ({ classId, userId }) => {
      socket.leave(`class:${classId}`);
      socket.to(`class:${classId}`).emit('class:user-left', { userId });
    });

    // ── Notifications ───────────────────────
    socket.on('notification:send', ({ targetUserId, notification }) => {
      const targetSocket = onlineUsers.get(targetUserId);
      if (targetSocket) {
        io.to(targetSocket.socketId).emit('notification:new', notification);
      }
    });

    // ── Doubt Updates ───────────────────────
    socket.on('doubt:new', ({ courseId, doubt }) => {
      io.to(`course:${courseId}`).emit('doubt:posted', doubt);
    });

    socket.on('doubt:reply', ({ doubtId, reply }) => {
      io.emit('doubt:new-reply', { doubtId, reply });
    });

    // ── Course Room ─────────────────────────
    socket.on('course:join', ({ courseId }) => {
      socket.join(`course:${courseId}`);
    });

    // ── Typing Indicator ────────────────────
    socket.on('typing:start', ({ roomId, name }) => {
      socket.to(roomId).emit('typing:show', { name });
    });

    socket.on('typing:stop', ({ roomId }) => {
      socket.to(roomId).emit('typing:hide');
    });

    // ── Disconnect ──────────────────────────
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('users:online', onlineUsers.size);
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
}
