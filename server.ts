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
import { db, getSupabase } from './src/services/supabase';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Nginx)
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict to your frontend domain
    methods: ["GET", "POST"]
  }
});

// --- Security Middleware ---
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  validate: { xForwardedForHeader: false }, // Suppress the warning/error about X-Forwarded-For
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

// --- Admin Auth Routes ---

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: { error: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/admin/setup', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // 1. Validate Gmail domain
    if (!email.endsWith('@gmail.com')) {
      return res.status(400).json({ error: 'Only Gmail accounts allowed' });
    }

    // 2. Check if any admin already exists (one-time setup)
    const { count, error: countError } = await getSupabase()
      .from('admins')
      .select('*', { count: 'exact', head: true });

    if (countError && countError.code !== '42P01') {
      console.error('Check admin error:', countError);
      return res.status(500).json({ error: 'Database error during setup check.' });
    }

    if (count && count > 0) {
      return res.status(400).json({ error: 'Admin already exists. Setup is disabled.' });
    }

    // 3. Create user in Supabase Auth
    const { data: authData, error: authError } = await getSupabase().auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'admin', name: name || 'Admin' }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return res.status(400).json({ error: authError.message });
    }

    // 4. Insert into admins table
    const { error: insertError } = await getSupabase()
      .from('admins')
      .insert({
        id: authData.user.id,
        email,
        name: name || 'Admin',
        role: 'admin'
      });

    if (insertError) {
      console.error('Admin insert error:', insertError);
      // Cleanup auth user if DB insert fails
      await getSupabase().auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({ error: 'Failed to save admin record.' });
    }

    res.json({ success: true, message: 'Admin account created successfully' });
  } catch (err: any) {
    console.error('Admin setup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/login', adminLimiter, async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Validate Gmail domain
    if (!email.endsWith('@gmail.com')) {
      return res.status(400).json({ error: 'Only Gmail accounts allowed' });
    }

    // 2. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    // 3. Check if email is in the whitelist (admins table)
    const { data: adminRecord, error: adminError } = await getSupabase()
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (adminError) {
      console.error('Admin check error:', adminError);
      if (adminError.code === '42P01') {
        return res.status(500).json({ error: 'Database error: "admins" table not found. Please create it in Supabase.' });
      }
      if (adminError.code === 'PGRST116') {
        // Not found is fine, just means not an admin
      } else {
        return res.status(500).json({ error: 'Database error during admin check.' });
      }
    }

    if (!adminRecord) {
      // Sign out if not an admin
      await getSupabase().auth.signOut();
      return res.status(403).json({ error: 'Unauthorized: Not an admin' });
    }

    // 4. Return session info
    res.json({
      token: authData.session.access_token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: 'admin',
        name: adminRecord.name || 'Admin'
      },
      expires_at: authData.session.expires_at
    });
  } catch (err: any) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, role, name } = req.body;
  try {
    // Check if user exists
    const { data: existingUser } = await db.users().select('id').eq('email', email).single();
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    // Create user in DB
    const { data: newUser, error } = await db.users().insert({
      email,
      password, // In real app, hash this!
      role: role || 'advertiser',
      name,
      subscription_tier: 'free'
    }).select().single();

    if (error) throw error;

    // Create wallet for user
    await db.wallets().insert({ user_id: newUser.id, balance: 0 });

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, process.env.JWT_SECRET!, { expiresIn: '24h' });
    res.json({ token, user: newUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data: user, error } = await db.users().select('*').eq('email', email).eq('password', password).single();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '24h' });
    res.json({ token, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authenticate, async (req: any, res) => {
  try {
    const { data: user, error } = await db.users().select('*').eq('id', req.user.id).single();
    if (error || !user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Routes
app.get('/api/admin/overview', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { count: activeCampaigns } = await db.campaigns().select('*', { count: 'exact', head: true }).eq('status', 'active');
    const { count: totalDrivers } = await db.users().select('*', { count: 'exact', head: true }).eq('role', 'driver');
    const { count: totalImpressions } = await db.impressions().select('*', { count: 'exact', head: true });

    res.json({
      metrics: {
        advertisers: 12, // Mocked
        drivers: totalDrivers || 0,
        campaigns: activeCampaigns || 0,
        vehicles: totalDrivers || 0,
        revenueToday: 45000, // Mocked
        pendingPayouts: 12000, // Mocked
        totalImpressions: totalImpressions || 0
      },
      revenueTrend: [
        { date: '2026-03-01', revenue: 45000 },
        { date: '2026-03-05', revenue: 52000 },
        { date: '2026-03-10', revenue: 48000 },
        { date: '2026-03-15', revenue: 61000 },
        { date: '2026-03-19', revenue: 55000 }
      ],
      routePerformance: [
        { name: 'Third Mainland Bridge', active_screens: 12 },
        { name: 'Ikorodu Road', active_screens: 8 },
        { name: 'Lekki-Epe Expressway', active_screens: 15 },
        { name: 'Oshodi-Apapa Expressway', active_screens: 6 }
      ]
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/advertisers', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { data } = await db.users().select('*, campaigns(count, budget)').eq('role', 'advertiser');
    const formatted = data?.map((ad: any) => ({
      ...ad,
      campaign_count: ad.campaigns?.length || 0,
      total_budget: ad.campaigns?.reduce((acc: number, c: any) => acc + (c.budget || 0), 0) || 0
    }));
    res.json(formatted || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/drivers', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { data } = await db.users().select('*, wallets(balance), tracking(*)').eq('role', 'driver');
    const formatted = data?.map((d: any) => ({
      ...d,
      balance: d.wallets?.[0]?.balance || 0,
      device_id: d.tracking?.[0]?.device_id || 'N/A',
      device_status: d.tracking?.[0]?.status || 'offline',
      last_lat: d.tracking?.[0]?.last_lat || 6.5244,
      last_lng: d.tracking?.[0]?.last_lng || 3.3792,
      overall_score: 85, // Mocked
      rank_category: 'silver', // Mocked
      campaigns_accepted: 3 // Mocked
    }));
    res.json(formatted || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/campaigns', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { data } = await db.campaigns().select('*, users!advertiser_id(name), routes(name)');
    const formatted = data?.map((c: any) => ({
      ...c,
      advertiser_name: c.users?.name || 'Unknown',
      route_name: c.routes?.name || 'General Route',
      total_impressions: 0, // Mocked
      total_minutes: 0 // Mocked
    }));
    res.json(formatted || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/notifications', authenticate, authorize(['admin']), async (req, res) => {
  res.json([
    { id: 1, type: 'alert', message: 'Vehicle DF-2026-001 is off-route', time: '2 mins ago' },
    { id: 2, type: 'info', message: 'New advertiser registered: TechCorp', time: '1 hour ago' },
    { id: 3, type: 'success', message: 'Campaign "Summer Sale" budget reached', time: '3 hours ago' }
  ]);
});

app.post('/api/admin/users/:id/status', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const { error } = await db.users().update({ subscription_tier: status }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.post('/api/admin/campaigns/:id/status', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const { error } = await db.campaigns().update({ status }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Advertiser Routes
app.get('/api/advertiser/stats/:id', authenticate, authorize(['advertiser', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { count: activeCampaigns } = await db.campaigns().select('*', { count: 'exact', head: true }).eq('advertiser_id', id).eq('status', 'active');
    const { data: wallet } = await db.wallets().select('balance').eq('user_id', id).single();
    
    res.json({
      active_campaigns: activeCampaigns || 0,
      total_spend: 150000, // Mocked for now
      total_impressions: 450000, // Mocked for now
      wallet_balance: wallet?.balance || 0
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/advertiser/top-drivers', authenticate, authorize(['advertiser', 'admin']), async (req, res) => {
  res.json([
    { id: 1, name: 'John Okafor', rating: 4.9, earnings: 45000 },
    { id: 2, name: 'Musa Ibrahim', rating: 4.8, earnings: 38000 }
  ]);
});

// Driver Routes
app.get('/api/driver/stats/:id', authenticate, authorize(['driver', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { data: wallet } = await db.wallets().select('balance').eq('user_id', id).single();
    const { count: activeCampaigns } = await db.campaigns().select('*', { count: 'exact', head: true }).eq('status', 'active'); // In real app, filter by driver assignment
    
    res.json({
      total_earnings: wallet?.balance || 0,
      active_campaigns: activeCampaigns || 0,
      completed_trips: 145, // Mocked
      rating: 4.8 // Mocked
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
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
      await db.rpc('increment_wallet', { user_id: req.user.id, amount: 10 });
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
  try {
    // Check if Supabase is configured
    getSupabase();
  } catch (error: any) {
    if (error.message === 'SUPABASE_NOT_CONFIGURED') {
      console.warn('⚠️  Supabase not configured. Skipping database seeding.');
      return;
    }
    throw error;
  }

  // Check if demo users exist
  const demoUsers = [
    { email: 'advertiser@danfodrive.com', password: 'password', role: 'advertiser', name: 'Advertiser User' },
    { email: 'driver@danfodrive.com', password: 'password', role: 'driver', name: 'Driver User' }
  ];

  for (const user of demoUsers) {
    const { data: existing } = await db.users().select('id').eq('email', user.email).single();
    if (!existing) {
      console.log(`Seeding ${user.role} user...`);
      const { data: newUser } = await db.users().insert({
        ...user,
        subscription_tier: 'free'
      }).select().single();
      
      if (newUser) {
        await db.wallets().insert({ user_id: newUser.id, balance: 1000 });
      }
    }
  }

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
const startServer = async () => {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = process.env.PORT || 3000;
  server.listen(Number(PORT), "0.0.0.0", async () => {
    console.log(`DanfoDrive Secure Backend running on port ${PORT}`);
    try {
      await seedDatabase();
    } catch (err) {
      console.error('Database seeding failed:', err);
    }
  });
};

startServer();
