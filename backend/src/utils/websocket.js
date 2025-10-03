const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

let io;

const initializeWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware for WebSocket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const [users] = await pool.query(
        'SELECT id, name, email, role, workspace_id FROM users WHERE id = ? AND is_active = true',
        [decoded.id]
      );

      if (users.length === 0) {
        return next(new Error('User not found'));
      }

      socket.user = users[0];
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user.id})`);

    // Join workspace room
    const workspaceRoom = `workspace_${socket.user.workspace_id}`;
    socket.join(workspaceRoom);

    // Join user's personal room
    const userRoom = `user_${socket.user.id}`;
    socket.join(userRoom);

    // Notify workspace about new connection
    socket.to(workspaceRoom).emit('user_online', {
      userId: socket.user.id,
      userName: socket.user.name
    });

    // Handle task updates
    socket.on('task_updated', (data) => {
      socket.to(workspaceRoom).emit('task_updated', {
        ...data,
        updatedBy: socket.user.name
      });
    });

    // Handle deal stage changes
    socket.on('deal_stage_changed', (data) => {
      socket.to(workspaceRoom).emit('deal_stage_changed', {
        ...data,
        changedBy: socket.user.name
      });
    });

    // Handle new contact
    socket.on('contact_created', (data) => {
      socket.to(workspaceRoom).emit('contact_created', {
        ...data,
        createdBy: socket.user.name
      });
    });

    // Handle new interaction
    socket.on('interaction_added', (data) => {
      socket.to(workspaceRoom).emit('interaction_added', {
        ...data,
        addedBy: socket.user.name
      });
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      socket.to(workspaceRoom).emit('user_typing', {
        userId: socket.user.id,
        userName: socket.user.name,
        context: data.context
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name} (${socket.user.id})`);
      socket.to(workspaceRoom).emit('user_offline', {
        userId: socket.user.id,
        userName: socket.user.name
      });
    });
  });

  return io;
};

// Helper function to emit events from controllers
const emitToWorkspace = (workspaceId, event, data) => {
  if (io) {
    io.to(`workspace_${workspaceId}`).emit(event, data);
  }
};

const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

module.exports = { 
  initializeWebSocket, 
  emitToWorkspace, 
  emitToUser 
};
