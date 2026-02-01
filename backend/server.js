const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

// Use mock database for development
const db = require('./mockDatabase');

dotenv.config();

const app = express();
const server = http.createServer(app);

// SİHİRLİ BÖLÜM: BURASI HERKESİ KABUL EDER
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

const memoryCache = new Map();
app.locals.db = db;
app.locals.cache = memoryCache;

// Routes
const locationRoutes = require('./routes/location');
const matchesRoutes = require('./routes/matches');
const checkinRoutes = require('./routes/checkin');
const authRoutes = require('./routes/auth');
const trackingRoutes = require('./routes/tracking');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const ProximityService = require('./services/proximityService');

app.use('/api/location', locationRoutes);

// Consolidated Services
const proximityService = new ProximityService(db);
const PatternService = require('./services/patternService');
const patternService = new PatternService(db);
const SuggestionEngine = require('./services/suggestionEngine');
const suggestionEngine = new SuggestionEngine(db, patternService);
const NotificationService = require('./services/notificationService');
const notificationService = new NotificationService(db);

const proximityRouter = require('./routes/proximity')(io, proximityService);
const suggestionsRouter = require('./routes/suggestions')(io, suggestionEngine);

const HeatMapService = require('./services/heatMapService');
const heatMapService = new HeatMapService(db);
const heatMapRouter = require('./routes/heatmap')(io, heatMapService);

const notificationRouter = require('./routes/notifications')(notificationService);

app.use('/api/matches', matchesRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/proximity', proximityRouter);
app.use('/api/suggestions', suggestionsRouter);
app.use('/api/heatmap', heatMapRouter);

setInterval(() => {
  proximityService.cleanupStaleUsers();
}, 10000);

app.get('/', (req, res) => {
  const stats = db.getStats();
  res.json({
    status: 'running',
    message: 'Tenkap Backend 🚀',
    mode: 'development (mock database)',
    stats
  });
});

app.get('/api/debug/stats', (req, res) => {
  res.json(db.getStats());
});

app.post('/api/debug/reset', (req, res) => {
  db.reset();
  memoryCache.clear();
  res.json({ message: 'Database reset successfully' });
});

const SMSService = require('./services/smsService');
const smsService = new SMSService();

setInterval(() => {
  smsService.cleanup();
}, 600000);

const smsRouter = require('./routes/sms')(smsService);
app.use('/api/sms', smsRouter);

io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('👋 User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3002;

server.listen(PORT, () => {
  console.log(`🚀 TENKAP BACKEND STARTED on PORT ${PORT}`);
});

module.exports = { app, db, memoryCache, io };
