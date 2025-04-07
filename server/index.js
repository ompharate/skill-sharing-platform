require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});

// Socket.IO event handling
const connectedUsers = new Map(); // To track online users

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // User provides their ID when connecting
  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });
  
  // Handle call requests
  socket.on('call-request', ({ from, to, fromEmail }) => {
    const toSocketId = connectedUsers.get(to);
    if (toSocketId) {
      io.to(toSocketId).emit('incoming-call', { from, fromEmail });
    } else {
      // User is offline
      socket.emit('call-rejected', { reason: 'User is offline' });
    }
  });
  
  // Handle call accepted
  socket.on('call-accepted', ({ from, to }) => {
    const fromSocketId = connectedUsers.get(from);
    if (fromSocketId) {
      io.to(fromSocketId).emit('call-accepted', { to });
    }
  });
  
  // Handle call rejected
  socket.on('call-rejected', ({ from, to, reason }) => {
    const fromSocketId = connectedUsers.get(from);
    if (fromSocketId) {
      io.to(fromSocketId).emit('call-rejected', { reason });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/api'));
app.use('/api/video', require('./routes/video'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));