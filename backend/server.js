const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

// Use mock database for development (no PostgreSQL needed)
const db = require('./mockDatabase');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// In-memory cache (instead of Redis)
const memoryCache = new Map();

// Make db and cache available globally
app.locals.db = db;
app.locals.cache = memoryCache;

// Routes
const locationRoutes = require('./routes/location');
const matchesRoutes = require('./routes/matches');
const checkinRoutes = require('./routes/checkin');
const authRoutes = require('./routes/auth');
const trackingRoutes = require('./routes/tracking'); // NEW: Tracking
const userRoutes = require('./routes/user'); // NEW: User
const adminRoutes = require('./routes/admin'); // NEW: Admin routes
const ProximityService = require('./services/proximityService'); // NEW: Proximity


app.use('/api/location', locationRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tracking', trackingRoutes); // NEW: Tracking
app.use('/api/user', userRoutes); // NEW: User
app.use('/api/admin', adminRoutes); // NEW: Admin routes

// Initialize Services (Consolidated)
const proximityService = new ProximityService(db); // ProximityService required at top
const PatternService = require('./services/patternService');
const patternService = new PatternService(db);
const SuggestionEngine = require('./services/suggestionEngine');
const suggestionEngine = new SuggestionEngine(db, patternService);
// NEW: Notification Service
const NotificationService = require('./services/notificationService');
const notificationService = new NotificationService(db);

// Initialize Routers
const proximityRouter = require('./routes/proximity')(io, proximityService);
const suggestionsRouter = require('./routes/suggestions')(io, suggestionEngine);

// Heat Map Service
const HeatMapService = require('./services/heatMapService');
const heatMapService = new HeatMapService(db);
const heatMapRouter = require('./routes/heatmap')(io, heatMapService);

// NEW: Notification Router
const notificationRouter = require('./routes/notifications')(notificationService);

// Register Routes
app.use('/api/location', locationRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/proximity', proximityRouter);
app.use('/api/suggestions', suggestionsRouter);
app.use('/api/heatmap', heatMapRouter);

// Cleanup stale users every 10 seconds
setInterval(() => {
  proximityService.cleanupStaleUsers();
}, 10000);


// Health Check
app.get('/', (req, res) => {
  const stats = db.getStats();
  res.json({
    status: 'running',
    message: 'Tenkap Backend 🚀',
    mode: 'development (mock database)',
    stats
  });
});

// Debug endpoint
app.get('/api/debug/stats', (req, res) => {
  res.json(db.getStats());
});

// Reset database endpoint (development only)
app.post('/api/debug/reset', (req, res) => {
  db.reset();
  memoryCache.clear();
  res.json({ message: 'Database reset successfully' });
});

// NEW: SMS Service Integration
const SMSService = require('./services/smsService');
const smsService = new SMSService();

// Cleanup expired codes every 10 minutes
setInterval(() => {
  smsService.cleanup();
}, 10 * 60 * 1000);

// Register SMS routes
const smsRouter = require('./routes/sms')(smsService);
app.use('/api/sms', smsRouter);

// Socket.io
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('👋 User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3002; // Changed to 3002 to bypass zombie process

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   🚀 TENKAP BACKEND STARTED           ║
╠═══════════════════════════════════════╣
║   Port: ${PORT}                          ║
║   Mode: Development (Mock DB)         ║
║   Health: http://localhost:${PORT}       ║
║   Stats: http://localhost:${PORT}/api/debug/stats
╚═══════════════════════════════════════╝
  `);
});

module.exports = { app, db, memoryCache, io };
