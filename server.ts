import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'danfo_drive_secret_2026';

app.use(cors());
app.use(express.json());

// --- Mock Database (for demo if Supabase not set up) ---
let users: any[] = [
  { id: '1', email: 'advertiser@danfodrive.com', password: '$2a$10$xV8.pX.pX.pX.pX.pX.pX.pX', role: 'advertiser', full_name: 'Tunde Okafor', wallet_balance: 50000 },
  { id: '2', email: 'driver@danfodrive.com', password: '$2a$10$xV8.pX.pX.pX.pX.pX.pX.pX', role: 'driver', full_name: 'Emeka Nwosu', wallet_balance: 12000 },
  { id: '3', email: 'admin@danfodrive.com', password: '$2a$10$xV8.pX.pX.pX.pX.pX.pX.pX', role: 'admin', full_name: 'Admin User', wallet_balance: 0 },
];

let campaigns: any[] = [
  { id: 'c1', advertiser_id: '1', name: 'Indomie Morning Rush', budget: 100000, cpm_rate: 50, status: 'active', start_date: '2026-03-01', end_date: '2026-04-01' },
  { id: 'c2', advertiser_id: '1', name: 'Coca-Cola Refresh', budget: 250000, cpm_rate: 60, status: 'paused', start_date: '2026-03-15', end_date: '2026-05-15' },
];

let ads: any[] = [
  { id: 'a1', campaign_id: 'c1', asset_url: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=800&q=80', qr_code_url: 'https://indomie.com.ng/promo', duration: 15 },
  { id: 'a2', campaign_id: 'c2', asset_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80', qr_code_url: 'https://coca-cola.com.ng/refresh', duration: 15 },
];

let devices: any[] = [
  { id: 'd1', driver_id: '2', vehicle_type: 'Danfo', status: 'online', last_heartbeat: new Date().toISOString(), current_lat: 6.5244, current_lng: 3.3792 },
  { id: 'd2', driver_id: '2', vehicle_type: 'Danfo', status: 'online', last_heartbeat: new Date().toISOString(), current_lat: 6.4549, current_lng: 3.4245 },
];

let impressions: any[] = [];

// --- Auth Middleware ---
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- API Routes ---

// Admin routes
app.post('/api/admin/setup', async (req, res) => {
  const { email, password, name } = req.body;
  
  // Check if admin already exists
  const adminExists = users.some(u => u.role === 'admin');
  if (adminExists) {
    return res.status(400).json({ error: 'Admin already initialized' });
  }

  const newAdmin = {
    id: 'admin-1',
    email,
    password, // In real app, hash this
    role: 'admin' as const,
    full_name: name,
    wallet_balance: 0
  };

  users.push(newAdmin);
  res.json({ message: 'Admin created successfully' });
});

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password && u.role === 'admin');
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name } });
});

// Auth
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: 'User not found' });
  
  // In a real app, use bcrypt.compare
  // const valid = await bcrypt.compare(password, user.password);
  const valid = password === 'password'; // Simple for demo
  if (!valid) return res.status(400).json({ error: 'Invalid password' });

  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name, wallet_balance: user.wallet_balance } });
});

// Campaigns
app.get('/api/campaigns', authenticate, (req: any, res) => {
  if (req.user.role === 'admin') return res.json(campaigns);
  res.json(campaigns.filter(c => c.advertiser_id === req.user.id));
});

app.post('/api/campaigns', authenticate, (req: any, res) => {
  const newCampaign = { ...req.body, id: `c${Date.now()}`, advertiser_id: req.user.id, status: 'draft' };
  campaigns.push(newCampaign);
  res.json(newCampaign);
});

// Ads
app.get('/api/ads/:campaignId', authenticate, (req, res) => {
  res.json(ads.filter(a => a.campaign_id === req.params.campaignId));
});

// Devices
app.get('/api/devices', authenticate, (req: any, res) => {
  if (req.user.role === 'admin') return res.json(devices);
  res.json(devices.filter(d => d.driver_id === req.user.id));
});

// Heartbeat & Impression Logging (Player API)
app.post('/api/player/heartbeat', (req, res) => {
  const { deviceId, lat, lng } = req.body;
  const device = devices.find(d => d.id === deviceId);
  if (device) {
    device.last_heartbeat = new Date().toISOString();
    device.current_lat = lat;
    device.current_lng = lng;
    device.status = 'online';
  }
  
  // Find relevant ads for this location (simplified geofencing)
  // In real app, use PostGIS query
  const activeAds = ads.filter(a => {
    const campaign = campaigns.find(c => c.id === a.campaign_id);
    return campaign && campaign.status === 'active';
  });
  
  res.json({ ads: activeAds });
});

app.post('/api/player/impression', (req, res) => {
  const { deviceId, adId, lat, lng } = req.body;
  const newImpression = { id: `i${Date.now()}`, device_id: deviceId, ad_id: adId, timestamp: new Date().toISOString(), lat, lng };
  impressions.push(newImpression);
  res.json({ success: true });
});

// Stats
app.get('/api/stats/advertiser', authenticate, (req: any, res) => {
  const userCampaigns = campaigns.filter(c => c.advertiser_id === req.user.id);
  const totalSpend = userCampaigns.reduce((sum, c) => sum + (c.budget - 5000), 0); // Mock spend
  const totalImpressions = impressions.length * 10; // Mock multiplier
  res.json({ totalSpend, totalImpressions, activeCampaigns: userCampaigns.filter(c => c.status === 'active').length });
});

// --- Vite Integration ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DanfoDrive Server running on http://localhost:${PORT}`);
  });
}

startServer();
