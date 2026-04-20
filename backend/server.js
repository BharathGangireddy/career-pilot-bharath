const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();

// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});

// ================= SOCKET.IO =================
io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  // 🔥 Job Added
  socket.on('jobAdded', (job) => {
    console.log('📦 Job added:', job?.role);

    // Send to ALL other users
    socket.broadcast.emit('jobUpdate', {
      type: 'added',
      job
    });
  });

  // 🔥 Job Updated
  socket.on('jobUpdated', (job) => {
    console.log('✏️ Job updated:', job?._id);

    socket.broadcast.emit('jobUpdate', {
      type: 'updated',
      job
    });
  });

  // 🔥 Job Deleted
  socket.on('jobDeleted', (jobId) => {
    console.log('🗑️ Job deleted:', jobId);

    socket.broadcast.emit('jobUpdate', {
      type: 'deleted',
      jobId
    });
  });

  // 🔌 Disconnect
  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });
});

// ================= MIDDLEWARE =================
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// ================= ROUTES =================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/ai', require('./routes/ai'));

// ================= HEALTH =================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ================= DB + SERVER =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });