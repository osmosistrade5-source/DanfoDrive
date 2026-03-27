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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Mock Database (for demo if Supabase not set up) ---
let users: any[] = [
  { id: '1', email: 'advertiser@danfodrive.com', password: '', role: 'advertiser', full_name: 'Tunde Okafor', company_name: 'Tunde Ads', wallet_balance: 50000 },
  { id: '2', email: 'driver@danfodrive.com', password: '', role: 'driver', full_name: 'Emeka Nwosu', phone_number: '08012345678', vehicle_type: 'Danfo', license_number: 'LAG-12345', is_verified: true, wallet_balance: 12000 },
  { id: '3', email: 'osmosistrade5@gmail.com', password: '', role: 'admin', full_name: 'Michael Dinho', wallet_balance: 0 },
];

// Seed passwords with bcrypt
const seedPasswords = async () => {
  const salt = await bcrypt.genSalt(10);
  users[0].password = await bcrypt.hash('password', salt);
  users[1].password = await bcrypt.hash('password', salt);
  users[2].password = await bcrypt.hash('Michaeldinho7', salt);
  console.log('Database seeded with hashed passwords');
};
seedPasswords();

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
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.role === 'admin');
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name } });
});

app.get('/api/admin/me', authenticate, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Admin not found' });
  res.json({ id: user.id, email: user.email, role: user.role, full_name: user.full_name });
});

// Auth
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: 'User not found' });
  
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid password' });

  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name, company_name: user.company_name, wallet_balance: user.wallet_balance } });
});

// Driver Auth
app.post('/api/drivers/register', async (req, res) => {
  const { email, password, full_name, phone_number, vehicle_type, license_number } = req.body;
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = {
    id: `d${Date.now()}`,
    email,
    password: hashedPassword,
    role: 'driver',
    full_name,
    phone_number,
    vehicle_type,
    license_number,
    is_verified: false,
    wallet_balance: 0,
    created_at: new Date().toISOString()
  };

  users.push(newUser);

  const token = jwt.sign({ id: newUser.id, role: newUser.role, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ 
    token, 
    user: { 
      id: newUser.id, 
      email: newUser.email, 
      role: newUser.role, 
      full_name: newUser.full_name, 
      phone_number: newUser.phone_number,
      vehicle_type: newUser.vehicle_type,
      license_number: newUser.license_number,
      is_verified: newUser.is_verified,
      wallet_balance: newUser.wallet_balance 
    } 
  });
});

app.post('/api/drivers/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.role === 'driver');
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid driver credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid driver credentials' });
  }

  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ 
    token, 
    user: { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      full_name: user.full_name, 
      phone_number: user.phone_number,
      vehicle_type: user.vehicle_type,
      license_number: user.license_number,
      is_verified: user.is_verified,
      wallet_balance: user.wallet_balance 
    } 
  });
});

app.get('/api/drivers/me', authenticate, (req: any, res) => {
  if (req.user.role !== 'driver') return res.status(403).json({ error: 'Forbidden' });
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Driver not found' });
  res.json({ 
    id: user.id, 
    email: user.email, 
    role: user.role, 
    full_name: user.full_name, 
    phone_number: user.phone_number,
    vehicle_type: user.vehicle_type,
    license_number: user.license_number,
    is_verified: user.is_verified,
    wallet_balance: user.wallet_balance 
  });
});

// Advertiser Auth
app.post('/api/advertisers/register', async (req, res) => {
  const { email, password, company_name, full_name } = req.body;
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = {
    id: `u${Date.now()}`,
    email,
    password: hashedPassword,
    role: 'advertiser',
    full_name: full_name || company_name,
    company_name,
    wallet_balance: 0,
    created_at: new Date().toISOString()
  };

  users.push(newUser);

  const token = jwt.sign({ id: newUser.id, role: newUser.role, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ 
    token, 
    user: { 
      id: newUser.id, 
      email: newUser.email, 
      role: newUser.role, 
      full_name: newUser.full_name, 
      company_name: newUser.company_name, 
      wallet_balance: newUser.wallet_balance 
    } 
  });
});

app.post('/api/advertisers/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.role === 'advertiser');
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid advertiser credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid advertiser credentials' });
  }

  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ 
    token, 
    user: { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      full_name: user.full_name, 
      company_name: user.company_name, 
      wallet_balance: user.wallet_balance 
    } 
  });
});

app.get('/api/advertisers/me', authenticate, (req: any, res) => {
  if (req.user.role !== 'advertiser') return res.status(403).json({ error: 'Forbidden' });
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Advertiser not found' });
  res.json({ 
    id: user.id, 
    email: user.email, 
    role: user.role, 
    full_name: user.full_name, 
    company_name: user.company_name, 
    wallet_balance: user.wallet_balance 
  });
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

app.post('/api/devices', authenticate, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  
  const newDevice = { 
    ...req.body, 
    id: `d${devices.length + 1}`, 
    status: 'offline', 
    last_heartbeat: new Date().toISOString(),
    current_lat: 6.5244,
    current_lng: 3.3792
  };
  devices.push(newDevice);
  res.json(newDevice);
});

// Stats
app.get('/api/stats/admin', authenticate, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  
  const totalSpend = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  const totalImpressions = impressions.length * 10;
  const totalDrivers = users.filter(u => u.role === 'driver').length;
  const totalAdvertisers = users.filter(u => u.role === 'advertiser').length;
  
  res.json({ 
    totalSpend, 
    totalImpressions, 
    totalDrivers, 
    totalAdvertisers,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    pendingCampaigns: campaigns.filter(c => c.status === 'pending' || c.status === 'draft').length,
    onlineDevices: devices.filter(d => d.status === 'online').length
  });
});

app.get('/api/stats/advertiser', authenticate, (req: any, res) => {
  const advertiserCampaigns = campaigns.filter(c => c.advertiser_id === req.user.id);
  const totalSpend = advertiserCampaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  const activeCampaigns = advertiserCampaigns.filter(c => c.status === 'active').length;
  
  res.json({
    totalSpend,
    totalImpressions: Math.floor(totalSpend / 50) * 10, // Mock calculation
    activeCampaigns
  });
});

app.post('/api/admin/campaigns/:id/status', authenticate, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  
  const { status } = req.body;
  const campaign = campaigns.find(c => c.id === req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
  
  campaign.status = status;
  res.json(campaign);
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
