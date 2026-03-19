import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
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
  const { email, password, role } = req.body;
  // In a real app, verify against Supabase Auth
  // For now, return a mock token with the requested role
  const token = jwt.sign({ id: 'user-123', email, role: role || 'advertiser' }, process.env.JWT_SECRET!, { expiresIn: '24h' });
  res.json({ token, user: { id: 'user-123', email, role: role || 'advertiser' } });
});

// Admin Routes
app.get('/api/admin/overview', authenticate, authorize(['admin']), async (req, res) => {
  res.json({
    total_revenue: 1250000,
    active_campaigns: 45,
    total_drivers: 120,
    total_impressions: 8500000,
    growth: 12.5
  });
});

app.get('/api/admin/advertisers', authenticate, authorize(['admin']), async (req, res) => {
  const { data } = await db.users().select('*').eq('role', 'advertiser');
  res.json(data || []);
});

app.get('/api/admin/drivers', authenticate, authorize(['admin']), async (req, res) => {
  const { data } = await db.users().select('*').eq('role', 'driver');
  res.json(data || []);
});

app.get('/api/admin/campaigns', authenticate, authorize(['admin']), async (req, res) => {
  const { data } = await db.campaigns().select('*, users(email)');
  res.json(data || []);
});

// Advertiser Routes
app.get('/api/advertiser/stats/:id', authenticate, authorize(['advertiser', 'admin']), async (req, res) => {
  res.json({
    active_campaigns: 3,
    total_spend: 150000,
    total_impressions: 450000,
    wallet_balance: 25000
  });
});

app.get('/api/advertiser/top-drivers', authenticate, authorize(['advertiser', 'admin']), async (req, res) => {
  res.json([
    { id: 1, name: 'John Okafor', rating: 4.9, earnings: 45000 },
    { id: 2, name: 'Musa Ibrahim', rating: 4.8, earnings: 38000 }
  ]);
});

// Driver Routes
app.get('/api/driver/stats/:id', authenticate, authorize(['driver', 'admin']), async (req, res) => {
  res.json({
    total_earnings: 85000,
    active_campaigns: 2,
    completed_trips: 145,
    rating: 4.8
  });
});

app.get('/api/driver/active-campaigns/:id', authenticate, authorize(['driver', 'admin']), async (req, res) => {
  const { data } = await db.campaigns().select('*').eq('status', 'active').limit(2);
  res.json(data || []);
});

// Route & Device Routes
app.get('/api/routes', async (req, res) => {
  const { data } = await db.routes().select('*');
  res.json(data || []);
});

app.get('/api/devices', async (req, res) => {
  const { data } = await db.tracking().select('*, users(email)').limit(10);
  res.json(data || []);
});

// Ad Serving (For Player)
app.get('/api/ads/active', async (req, res) => {
  const { lat, lng } = req.query;
  // In a real app, filter campaigns by geofence
  const { data } = await db.campaigns().select('*').eq('status', 'active').limit(5);
  res.json(data || []);
});

// Wallet & Subscription
app.post('/api/wallet/deposit', authenticate, authorize(['advertiser']), async (req: any, res) => {
  const { amount } = req.body;
  const { PaymentService } = await import('./src/services/payments');
  try {
    const session = await PaymentService.initializeTransaction(req.user.email, amount, { userId: req.user.id });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Payment initialization failed' });
  }
});

app.post('/api/subscription/pay', authenticate, authorize(['advertiser']), async (req: any, res) => {
  const { tier, amount } = req.body;
  // Deduct from wallet and update tier
  const { data: wallet } = await db.wallets().select('balance').eq('user_id', req.user.id).single();
  if (wallet && wallet.balance >= amount) {
    await db.wallets().update({ balance: wallet.balance - amount }).eq('user_id', req.user.id);
    await db.users().update({ subscription_tier: tier }).eq('id', req.user.id);
    res.json({ success: true, tier });
  } else {
    res.status(400).json({ error: 'Insufficient balance' });
  }
});

// Campaign Management
app.get('/api/campaigns', authenticate, async (req, res) => {
  const { data, error } = await db.campaigns().select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

app.post('/api/campaigns', authenticate, authorize(['advertiser', 'admin']), async (req, res) => {
  const { data, error } = await db.campaigns().insert({ ...req.body, status: 'pending' });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Impression Logging (Unauthenticated for player demo, or use device token)
app.post('/api/impressions/log', async (req, res) => {
  const { adId, lat, lng, speed, deviceId } = req.body;
  // Basic verification
  if (speed > 5) {
    await db.impressions().insert({
      ad_id: adId,
      lat,
      lng,
      verified: true,
      metadata: { speed, deviceId }
    });
    res.json({ status: 'logged' });
  } else {
    res.status(400).json({ error: 'Vehicle not moving' });
  }
});

// Impression Verification (Secure version for drivers)
app.post('/api/impressions/verify', authenticate, authorize(['driver']), async (req: any, res) => {
  const { campaignId, lat, lng, adId } = req.body;
  const { MapService } = await import('./src/services/maps');
  
  try {
    const isCompliant = await MapService.verifyRouteCompliance([lat, lng], campaignId);
    if (isCompliant) {
      await db.impressions().insert({
        campaign_id: campaignId,
        driver_id: req.user.id,
        ad_id: adId,
        verified: true,
        lat,
        lng
      });
      // Atomic increment
      await db.client.rpc('increment_wallet', { user_id: req.user.id, amount: 10 });
      res.json({ status: 'verified', reward: 10 });
    } else {
      res.status(403).json({ error: 'Out of route' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// --- Database Initialization & Seeding ---
const seedDatabase = async () => {
  // Check if routes exist
  const { count } = await db.routes().select('*', { count: 'exact', head: true });
  
  if (count === 0) {
    console.log('Seeding database with initial routes...');
    const routes = [
      { 
        name: 'Ikeja - CMS (Morning Rush)', 
        city: 'Lagos', 
        transport_type: 'Bus', 
        available_vehicles: 45, 
        est_passengers_daily: 12500,
        coordinates: JSON.stringify([[6.5967, 3.3421], [6.5244, 3.3792], [6.4531, 3.3958]]),
        current_density: 'high'
      },
      { 
        name: 'Lekki Phase 1 - Ajah', 
        city: 'Lagos', 
        transport_type: 'Taxi', 
        available_vehicles: 32, 
        est_passengers_daily: 8500,
        coordinates: JSON.stringify([[6.4474, 3.4733], [6.4674, 3.5733], [6.4674, 3.6733]]),
        current_density: 'medium'
      },
      { 
        name: 'Wuse II - Garki', 
        city: 'Abuja', 
        transport_type: 'Taxi', 
        available_vehicles: 28, 
        est_passengers_daily: 6200,
        coordinates: JSON.stringify([[9.0765, 7.4985], [9.0565, 7.4885], [9.0365, 7.4785]]),
        current_density: 'high'
      }
    ];
    await db.routes().insert(routes);
  }
};

// --- Start Server ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  console.log(`DanfoDrive Secure Backend running on port ${PORT}`);
  try {
    await seedDatabase();
  } catch (err) {
    console.error('Database seeding failed:', err);
  }
});
