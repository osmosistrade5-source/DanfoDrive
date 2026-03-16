import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { authenticate, authorize } from './src/middleware/auth';
import { db } from './src/services/supabase';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict to your frontend domain
    methods: ["GET", "POST"]
  }
});

// --- Security Middleware ---
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// --- WebSocket Logic ---
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Driver location updates
  socket.on('driver:location', async (data) => {
    const { driverId, lat, lng, campaignId } = data;
    // Broadcast to relevant advertisers/admins
    io.emit(`tracking:${campaignId}`, { driverId, lat, lng, timestamp: new Date() });
    
    // Save to DB (throttled in real app)
    await db.tracking().insert({ driver_id: driverId, lat, lng, campaign_id: campaignId });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// --- API Routes ---

// Auth Routes (Public)
app.post('/api/auth/login', async (req, res) => {
  // Implementation: Verify credentials against Supabase, return JWT
  res.json({ token: 'mock-jwt-token', user: { role: 'advertiser' } });
});

// Campaign Routes (Protected)
app.get('/api/campaigns', authenticate, async (req, res) => {
  const { data, error } = await db.campaigns().select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/campaigns', authenticate, authorize(['advertiser', 'admin']), async (req, res) => {
  const { data, error } = await db.campaigns().insert(req.body);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Wallet Routes
app.get('/api/wallets/balance', authenticate, async (req: any, res) => {
  const { data, error } = await db.wallets().select('balance').eq('user_id', req.user.id).single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Payment Routes
app.post('/api/payments/deposit', authenticate, authorize(['advertiser']), async (req: any, res) => {
  const { amount } = req.body;
  const { PaymentService } = await import('./src/services/payments');
  const session = await PaymentService.initializeTransaction(req.user.email, amount, { userId: req.user.id });
  res.json(session);
});

// Impression Verification (Critical)
app.post('/api/impressions/verify', authenticate, authorize(['driver']), async (req: any, res) => {
  const { campaignId, lat, lng, adId } = req.body;
  const { MapService } = await import('./src/services/maps');
  
  try {
    // 1. Verify GPS is on route
    const isCompliant = await MapService.verifyRouteCompliance([lat, lng], campaignId);
    
    if (isCompliant) {
      // 2. Record verified impression
      await db.impressions().insert({
        campaign_id: campaignId,
        driver_id: req.user.id,
        ad_id: adId,
        verified: true,
        lat,
        lng
      });
      
      // 3. Update driver earnings (atomic in real app)
      await db.wallets().update({ balance: db.client.rpc('increment', { x: 10 }) as any }).eq('user_id', req.user.id);
      
      res.json({ status: 'verified', reward: 10 });
    } else {
      res.status(403).json({ error: 'Out of route. Impression not recorded.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`DanfoDrive Secure Backend running on port ${PORT}`);
});
