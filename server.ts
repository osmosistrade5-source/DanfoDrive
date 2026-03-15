import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

let db: Database.Database;
try {
  db = new Database(":memory:");
  console.log('[DB] Database initialized in-memory');
} catch (err) {
  console.error('[DB] Failed to initialize database:', err);
  process.exit(1);
}

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    role TEXT, -- 'advertiser', 'driver', 'admin'
    name TEXT,
    balance REAL DEFAULT 0,
    subscription_tier TEXT DEFAULT 'none', -- 'starter', 'growth', 'enterprise'
    bank_name TEXT,
    account_number TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER,
    driver_id INTEGER,
    device_id TEXT UNIQUE,
    vehicle_type TEXT, -- 'danfo', 'brt', 'taxi'
    vehicle_reg TEXT,
    capacity INTEGER DEFAULT 14, -- Default Danfo capacity
    status TEXT DEFAULT 'offline',
    battery_level INTEGER DEFAULT 100,
    last_lat REAL,
    last_lng REAL,
    last_speed REAL DEFAULT 0,
    last_ping DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_heartbeat DATETIME,
    FOREIGN KEY(owner_id) REFERENCES users(id),
    FOREIGN KEY(driver_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    city TEXT,
    available_vehicles INTEGER,
    est_passengers_daily INTEGER,
    coordinates TEXT, -- JSON string of path
    transport_type TEXT DEFAULT 'Danfo',
    avg_passengers_per_hour INTEGER DEFAULT 0,
    peak_hours TEXT,
    duration_mins INTEGER DEFAULT 0,
    cost_per_minute REAL DEFAULT 0.5,
    current_density TEXT DEFAULT 'medium'
  );

  CREATE TABLE IF NOT EXISTS wallet_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount REAL,
    type TEXT, -- 'deposit', 'spend', 'payout'
    description TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    advertiser_id INTEGER,
    name TEXT,
    budget REAL,
    budget_remaining REAL,
    status TEXT DEFAULT 'active', -- 'active', 'paused', 'completed'
    route_id INTEGER,
    drivers_count INTEGER,
    schedule_json TEXT, -- JSON of time blocks
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(advertiser_id) REFERENCES users(id),
    FOREIGN KEY(route_id) REFERENCES routes(id)
  );

  CREATE TABLE IF NOT EXISTS ads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER,
    asset_url TEXT,
    duration_secs INTEGER DEFAULT 15,
    qr_code_data TEXT,
    approval_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    FOREIGN KEY(campaign_id) REFERENCES campaigns(id)
  );

  CREATE TABLE IF NOT EXISTS impressions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER,
    ad_id INTEGER,
    campaign_id INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    lat REAL,
    lng REAL,
    speed REAL DEFAULT 0,
    is_moving BOOLEAN DEFAULT 0,
    is_on_route BOOLEAN DEFAULT 0,
    estimated_passengers INTEGER DEFAULT 1,
    is_verified BOOLEAN DEFAULT 0,
    verification_signals TEXT, -- JSON string of signals
    FOREIGN KEY(device_id) REFERENCES devices(id),
    FOREIGN KEY(ad_id) REFERENCES ads(id),
    FOREIGN KEY(campaign_id) REFERENCES campaigns(id)
  );

  CREATE TABLE IF NOT EXISTS payouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount REAL,
    status TEXT DEFAULT 'pending',
    bank_name TEXT,
    account_number TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS driver_campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id INTEGER,
    campaign_id INTEGER,
    status TEXT DEFAULT 'active', -- 'active', 'completed'
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(driver_id) REFERENCES users(id),
    FOREIGN KEY(campaign_id) REFERENCES campaigns(id)
  );

  CREATE TABLE IF NOT EXISTS driver_daily_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id INTEGER,
    campaign_id INTEGER,
    date DATE DEFAULT (DATE('now')),
    minutes_played INTEGER DEFAULT 0,
    earnings REAL DEFAULT 0,
    FOREIGN KEY(driver_id) REFERENCES users(id),
    FOREIGN KEY(campaign_id) REFERENCES campaigns(id)
  );

  CREATE TABLE IF NOT EXISTS qr_scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    impression_id INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_ip TEXT,
    reward_type TEXT,
    FOREIGN KEY(impression_id) REFERENCES impressions(id)
  );

  CREATE TABLE IF NOT EXISTS driver_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id INTEGER UNIQUE,
    overall_score INTEGER DEFAULT 0,
    playback_score INTEGER DEFAULT 0,
    compliance_score INTEGER DEFAULT 0,
    uptime_score INTEGER DEFAULT 0,
    acceptance_score INTEGER DEFAULT 0,
    rating_score INTEGER DEFAULT 0,
    rank_category TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(driver_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS driver_performance_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id INTEGER,
    score INTEGER,
    date DATE DEFAULT (DATE('now')),
    FOREIGN KEY(driver_id) REFERENCES users(id)
  );
`);

// Migration: Ensure columns exist
try { db.exec("ALTER TABLE users ADD COLUMN subscription_tier TEXT DEFAULT 'none'"); } catch (e) {}
try { db.exec("ALTER TABLE campaigns ADD COLUMN budget_remaining REAL"); } catch (e) {}
try { db.exec("ALTER TABLE campaigns ADD COLUMN route_id INTEGER"); } catch (e) {}
try { db.exec("ALTER TABLE campaigns ADD COLUMN drivers_count INTEGER"); } catch (e) {}
try { db.exec("ALTER TABLE campaigns ADD COLUMN schedule_json TEXT"); } catch (e) {}

// Seed data
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  db.prepare("INSERT INTO users (email, role, name, balance, subscription_tier) VALUES (?, ?, ?, ?, ?)")
    .run("advertiser@example.com", "advertiser", "Tunde Okafor", 250000, "growth");
  
  db.prepare("INSERT INTO routes (name, city, available_vehicles, est_passengers_daily, coordinates, transport_type, avg_passengers_per_hour, peak_hours, duration_mins, cost_per_minute, current_density) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run("Ikeja - CMS (Third Mainland)", "Lagos", 45, 120000, JSON.stringify([[100, 100], [200, 150], [350, 180], [500, 250]]), "Danfo", 4500, "07:00-10:00, 16:00-20:00", 45, 1.2, "high");
  db.prepare("INSERT INTO routes (name, city, available_vehicles, est_passengers_daily, coordinates, transport_type, avg_passengers_per_hour, peak_hours, duration_mins, cost_per_minute, current_density) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run("Lekki - Ajah Expressway", "Lagos", 32, 85000, JSON.stringify([[500, 250], [600, 300], [750, 350], [850, 400]]), "Taxi", 2800, "08:00-11:00, 17:00-21:00", 35, 2.5, "medium");
  db.prepare("INSERT INTO routes (name, city, available_vehicles, est_passengers_daily, coordinates, transport_type, avg_passengers_per_hour, peak_hours, duration_mins, cost_per_minute, current_density) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run("Oshodi - Abule Egba (BRT)", "Lagos", 60, 250000, JSON.stringify([[100, 100], [150, 250], [180, 400], [220, 550]]), "Bus", 8500, "06:00-09:00, 15:00-19:00", 60, 0.8, "high");
  db.prepare("INSERT INTO routes (name, city, available_vehicles, est_passengers_daily, coordinates, transport_type, avg_passengers_per_hour, peak_hours, duration_mins, cost_per_minute, current_density) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run("Surulere - Yaba - Oyingbo", "Lagos", 25, 45000, JSON.stringify([[350, 180], [380, 250], [400, 320], [420, 400]]), "Danfo", 1500, "08:00-10:00, 17:00-19:00", 25, 1.0, "low");
  db.prepare("INSERT INTO routes (name, city, available_vehicles, est_passengers_daily, coordinates, transport_type, avg_passengers_per_hour, peak_hours, duration_mins, cost_per_minute, current_density) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run("Gwarinpa - Wuse II - Central Area", "Abuja", 18, 35000, JSON.stringify([[700, 100], [750, 150], [800, 200], [850, 250]]), "Taxi", 1200, "07:30-09:30, 16:30-18:30", 30, 3.0, "medium");
  db.prepare("INSERT INTO routes (name, city, available_vehicles, est_passengers_daily, coordinates, transport_type, avg_passengers_per_hour, peak_hours, duration_mins, cost_per_minute, current_density) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run("Maitama - Asokoro - Airport", "Abuja", 12, 25000, JSON.stringify([[850, 250], [900, 350], [920, 450], [950, 550]]), "Taxi", 800, "08:00-10:00, 17:00-19:00", 40, 4.5, "low");

  db.prepare("INSERT INTO campaigns (advertiser_id, name, budget, budget_remaining, status, route_id, drivers_count, schedule_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .run(1, "Indomie Morning Rush", 100000, 85400, "active", 1, 15, JSON.stringify([{start: "07:00", end: "10:00"}]));

  db.prepare("INSERT INTO wallet_transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)")
    .run(1, 200000, "deposit", "Initial Wallet Top-up");

  db.prepare("INSERT INTO users (email, role, name, balance) VALUES (?, ?, ?, ?)")
    .run("driver@example.com", "driver", "Emeka Nwosu", 24500);

  db.prepare("INSERT INTO users (email, role, name, balance) VALUES (?, ?, ?, ?)")
    .run("driver2@example.com", "driver", "Babatunde Ade", 15000);

  db.prepare("INSERT INTO users (email, role, name, balance) VALUES (?, ?, ?, ?)")
    .run("driver3@example.com", "driver", "Chidi Okafor", 32000);

  // Seed Driver Campaigns and Stats
  db.prepare("INSERT INTO driver_campaigns (driver_id, campaign_id) VALUES (?, ?)").run(2, 1);
  db.prepare("INSERT INTO driver_campaigns (driver_id, campaign_id) VALUES (?, ?)").run(3, 1);
  db.prepare("INSERT INTO driver_campaigns (driver_id, campaign_id) VALUES (?, ?)").run(4, 1);

  db.prepare("INSERT INTO driver_daily_stats (driver_id, campaign_id, date, minutes_played, earnings) VALUES (?, ?, DATE('now'), ?, ?)")
    .run(2, 1, 120, 1200);
  db.prepare("INSERT INTO driver_daily_stats (driver_id, campaign_id, date, minutes_played, earnings) VALUES (?, ?, DATE('now', '-1 day'), ?, ?)")
    .run(2, 1, 300, 3000);
  db.prepare("INSERT INTO driver_daily_stats (driver_id, campaign_id, date, minutes_played, earnings) VALUES (?, ?, DATE('now', '-2 days'), ?, ?)")
    .run(2, 1, 280, 2800);

  db.prepare("INSERT INTO devices (owner_id, driver_id, device_id, vehicle_type, vehicle_reg, status, battery_level, last_lat, last_lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(2, 2, "DF-2026-001", "Danfo", "LAG-123-XY", "online", 85, 6.5244, 3.3792);

  // Seed Performance Data for Drivers
  db.prepare(`
    INSERT OR REPLACE INTO driver_performance (driver_id, overall_score, playback_score, compliance_score, uptime_score, acceptance_score, rating_score, rank_category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(2, 92, 95, 88, 90, 100, 95, "Elite Driver");

  db.prepare(`
    INSERT OR REPLACE INTO driver_performance (driver_id, overall_score, playback_score, compliance_score, uptime_score, acceptance_score, rating_score, rank_category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(3, 85, 80, 90, 85, 90, 80, "Gold Driver");

  db.prepare(`
    INSERT OR REPLACE INTO driver_performance (driver_id, overall_score, playback_score, compliance_score, uptime_score, acceptance_score, rating_score, rank_category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(4, 78, 75, 80, 80, 70, 85, "Silver Driver");

  // Seed Performance History
  const historyDates = [
    { days: -6, score: 88 },
    { days: -5, score: 89 },
    { days: -4, score: 90 },
    { days: -3, score: 91 },
    { days: -2, score: 91 },
    { days: -1, score: 92 },
    { days: 0, score: 92 },
  ];

  historyDates.forEach(h => {
    db.prepare("INSERT INTO driver_performance_history (driver_id, score, date) VALUES (?, ?, DATE('now', ?))")
      .run(2, h.score, `${h.days} days`);
  });

  db.prepare("INSERT INTO ads (campaign_id, asset_url, duration_secs, approval_status) VALUES (?, ?, ?, ?)")
    .run(1, "https://picsum.photos/seed/indomie/800/600", 15, "approved");

  // Seed Impressions
  const ads = db.prepare("SELECT id, campaign_id FROM ads").all() as any[];
  const devices = db.prepare("SELECT id, capacity FROM devices").all() as any[];

  ads.forEach(ad => {
    // Create 50 verified impressions for each ad
    for (let i = 0; i < 50; i++) {
      const device = devices[Math.floor(Math.random() * devices.length)];
      const isVerified = Math.random() > 0.2 ? 1 : 0;
      const passengers = isVerified ? Math.floor((device.capacity || 14) * 0.7) : 0;
      
      db.prepare(`
        INSERT INTO impressions (device_id, ad_id, campaign_id, lat, lng, speed, is_moving, is_on_route, estimated_passengers, is_verified, verification_signals)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        device.id, 
        ad.id, 
        ad.campaign_id, 
        6.5244 + (Math.random() - 0.5) * 0.1, 
        3.3792 + (Math.random() - 0.5) * 0.1, 
        isVerified ? 30 + Math.random() * 20 : 0,
        isVerified ? 1 : 0,
        isVerified ? 1 : 0,
        passengers,
        isVerified,
        JSON.stringify({ ad_played: true, gps_moving: isVerified === 1, on_route: isVerified === 1, method: "seat-based-mvp" })
      );
    }
  });
}

import fs from "fs";

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Root health check
  app.get("/healthz", (req, res) => {
    res.send("OK");
  });

  // API Routes
  app.get("/api/campaigns", (req, res) => {
    const campaigns = db.prepare(`
      SELECT c.*, COUNT(a.id) as ad_count, r.name as route_name
      FROM campaigns c 
      LEFT JOIN ads a ON c.id = a.campaign_id 
      LEFT JOIN routes r ON c.route_id = r.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `).all();
    res.json(campaigns);
  });

  app.get("/api/routes", (req, res) => {
    const routes = db.prepare("SELECT * FROM routes").all();
    res.json(routes);
  });

  app.get("/api/wallet/stats/:userId", (req, res) => {
    const user = db.prepare("SELECT balance, subscription_tier FROM users WHERE id = ?").get(req.params.userId);
    const transactions = db.prepare("SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY timestamp DESC LIMIT 20").all(req.params.userId);
    res.json({ ...user, transactions });
  });

  app.get("/api/advertiser/stats/:userId", (req, res) => {
    const userId = req.params.userId;
    
    // Active Screens (Online devices currently assigned to active campaigns)
    const activeScreens = db.prepare(`
      SELECT COUNT(DISTINCT d.id) as count 
      FROM devices d
      JOIN campaigns c ON c.route_id IS NOT NULL
      WHERE d.status = 'online' AND c.advertiser_id = ? AND c.status = 'active'
    `).get(userId) as any;

    // Online vs Offline
    const fleetStatus = db.prepare(`
      SELECT 
        SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as online,
        SUM(CASE WHEN status = 'offline' THEN 1 ELSE 0 END) as offline
      FROM devices
    `).get() as any;
    
    // Total Verified Impressions
    const totalImpressions = db.prepare(`
      SELECT SUM(estimated_passengers) as count 
      FROM impressions i
      JOIN campaigns c ON i.campaign_id = c.id
      WHERE c.advertiser_id = ? AND i.is_verified = 1
    `).get(userId) as any;
    
    // Daily Spend (Verified only)
    // ₦10 per minute per vehicle. 
    // For MVP, we'll estimate spend based on verified impressions duration or a flat rate per verified play.
    // Let's assume each verified impression represents 1 minute of play for simplicity in this mock.
    const dailySpend = db.prepare(`
      SELECT COUNT(*) * 10 as spend
      FROM impressions i
      JOIN campaigns c ON i.campaign_id = c.id
      WHERE c.advertiser_id = ? AND i.is_verified = 1 AND i.timestamp >= date('now')
    `).get(userId) as any;

    const remainingBudget = db.prepare("SELECT SUM(budget_remaining) as total FROM campaigns WHERE advertiser_id = ?").get(userId) as any;
    const user = db.prepare("SELECT subscription_tier FROM users WHERE id = ?").get(userId) as any;

    // Route Performance
    const routePerformance = db.prepare(`
      SELECT r.name, COUNT(i.id) as impressions, SUM(i.estimated_passengers) as reach
      FROM impressions i
      JOIN campaigns c ON i.campaign_id = c.id
      JOIN routes r ON c.route_id = r.id
      WHERE c.advertiser_id = ? AND i.is_verified = 1
      GROUP BY r.id
    `).all(userId);

    res.json({
      activeScreens: activeScreens.count,
      fleetStatus: {
        online: fleetStatus.online || 0,
        offline: fleetStatus.offline || 0
      },
      totalImpressions: totalImpressions.count || 0,
      dailySpend: dailySpend.spend || 0,
      remainingBudget: remainingBudget.total || 0,
      subscription_tier: user?.subscription_tier || 'none',
      routePerformance
    });
  });

  // Log Impression with Verification Logic
  app.post("/api/impressions/log", (req, res) => {
    const { deviceId, adId, lat, lng, speed } = req.body;
    
    const device = db.prepare("SELECT * FROM devices WHERE device_id = ?").get(deviceId) as any;
    const ad = db.prepare("SELECT * FROM ads WHERE id = ?").get(adId) as any;
    
    if (!device || !ad) return res.status(404).json({ error: "Device or Ad not found" });
    
    const campaign = db.prepare("SELECT * FROM campaigns WHERE id = ?").get(ad.campaign_id) as any;
    
    // Verification Logic
    const isMoving = speed > 5;
    // Simplified route check: in a real app we'd check if (lat, lng) is on campaign.route_id path
    const isOnRoute = true; 
    
    const occupancyRate = 0.7; // 70% average occupancy
    const estimatedPassengers = Math.floor(device.capacity * occupancyRate);
    
    const isVerified = isMoving && isOnRoute;
    
    const signals = JSON.stringify({
      ad_played: true,
      gps_moving: isMoving,
      on_route: isOnRoute,
      speed: speed,
      method: "seat-based-mvp"
    });

    const result = db.prepare(`
      INSERT INTO impressions (device_id, ad_id, campaign_id, lat, lng, speed, is_moving, is_on_route, estimated_passengers, is_verified, verification_signals)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(device.id, ad.id, campaign.id, lat, lng, speed, isMoving ? 1 : 0, isOnRoute ? 1 : 0, estimatedPassengers, isVerified ? 1 : 0, signals);

    // Deduct budget if verified
    if (isVerified) {
      db.prepare("UPDATE campaigns SET budget_remaining = budget_remaining - 10 WHERE id = ?").run(campaign.id);
    }

    res.json({ success: true, impressionId: result.lastInsertRowid, isVerified });
  });

  app.post("/api/subscription/pay", (req, res) => {
    const { userId, tier, amount } = req.body;
    
    db.transaction(() => {
      // Deduct from balance
      db.prepare("UPDATE users SET balance = balance - ?, subscription_tier = ? WHERE id = ? AND balance >= ?")
        .run(amount, tier, userId, amount);
      
      // Record transaction
      db.prepare("INSERT INTO wallet_transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)")
        .run(userId, -amount, 'spend', `Monthly Subscription: ${tier.toUpperCase()} Plan`);
    })();

    res.json({ success: true });
  });

  app.post("/api/campaigns", (req, res) => {
    const { advertiser_id, name, budget, route_id, drivers_count, schedule_json } = req.body;
    try {
      const result = db.prepare(`
        INSERT INTO campaigns (advertiser_id, name, budget, budget_remaining, route_id, drivers_count, schedule_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(advertiser_id || 1, name, budget, budget, route_id, drivers_count, JSON.stringify(schedule_json));
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });

  app.get("/api/ads/pending", (req, res) => {
    const ads = db.prepare(`
      SELECT a.*, c.name as campaign_name, u.name as advertiser_name
      FROM ads a
      JOIN campaigns c ON a.campaign_id = c.id
      JOIN users u ON c.advertiser_id = u.id
      WHERE a.approval_status = 'pending'
    `).all();
    res.json(ads);
  });

  app.post("/api/ads/:id/approve", (req, res) => {
    const { status } = req.body; // 'approved' or 'rejected'
    db.prepare("UPDATE ads SET approval_status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/proof-of-play", (req, res) => {
    const logs = db.prepare(`
      SELECT i.*, d.vehicle_reg, a.asset_url, c.name as campaign_name
      FROM impressions i
      JOIN devices d ON i.device_id = d.id
      JOIN ads a ON i.ad_id = a.id
      JOIN campaigns c ON a.campaign_id = c.id
      ORDER BY i.timestamp DESC
      LIMIT 50
    `).all();
    res.json(logs);
  });

  const MIN_PAYOUT_THRESHOLD = 5000;

  app.get("/api/driver/stats/:userId", (req, res) => {
    const userId = req.params.userId;
    const user = db.prepare("SELECT balance FROM users WHERE id = ?").get(userId) as any;
    const todayStats = db.prepare(`
      SELECT SUM(minutes_played) as minutes, SUM(earnings) as earnings 
      FROM driver_daily_stats 
      WHERE driver_id = ? AND date = DATE('now')
    `).get(userId) as any;
    
    const activeCampaigns = db.prepare(`
      SELECT COUNT(*) as count FROM driver_campaigns WHERE driver_id = ? AND status = 'active'
    `).get(userId) as any;

    const totalPaid = db.prepare(`
      SELECT SUM(amount) as total FROM payouts WHERE user_id = ? AND status = 'paid'
    `).get(userId) as any;

    res.json({
      balance: user?.balance || 0,
      pendingBalance: todayStats?.earnings || 0,
      minPayoutThreshold: MIN_PAYOUT_THRESHOLD,
      todayEarnings: todayStats?.earnings || 0,
      todayMinutes: todayStats?.minutes || 0,
      activeCampaigns: activeCampaigns?.count || 0,
      totalPaid: totalPaid?.total || 0
    });
  });

  app.get("/api/driver/campaign-requests/:userId", (req, res) => {
    const userId = req.params.userId;
    // For demo, we assume the driver is on route 1
    const driverRouteId = 1; 
    
    const requests = db.prepare(`
      SELECT c.*, u.name as brand_name, r.name as route_name
      FROM campaigns c
      JOIN users u ON c.advertiser_id = u.id
      JOIN routes r ON c.route_id = r.id
      WHERE c.route_id = ? AND c.status = 'active'
      AND c.id NOT IN (SELECT campaign_id FROM driver_campaigns WHERE driver_id = ?)
      AND (SELECT COUNT(*) FROM driver_campaigns WHERE campaign_id = c.id) < c.drivers_count
    `).all(driverRouteId, userId);
    
    res.json(requests);
  });

  app.post("/api/driver/accept-campaign", (req, res) => {
    const { userId, campaignId } = req.body;
    
    const campaign = db.prepare("SELECT drivers_count FROM campaigns WHERE id = ?").get(campaignId) as any;
    const currentDrivers = db.prepare("SELECT COUNT(*) as count FROM driver_campaigns WHERE campaign_id = ?").get(campaignId) as any;
    
    if (currentDrivers.count >= campaign.drivers_count) {
      return res.status(400).json({ error: "Campaign is full" });
    }

    db.prepare("INSERT INTO driver_campaigns (driver_id, campaign_id) VALUES (?, ?)").run(userId, campaignId);
    res.json({ success: true });
  });

  app.get("/api/driver/active-campaigns/:userId", (req, res) => {
    const userId = req.params.userId;
    const campaigns = db.prepare(`
      SELECT c.*, u.name as brand_name, r.name as route_name, dc.joined_at,
             (SELECT minutes_played FROM driver_daily_stats WHERE driver_id = ? AND campaign_id = c.id AND date = DATE('now')) as minutes_today,
             (SELECT earnings FROM driver_daily_stats WHERE driver_id = ? AND campaign_id = c.id AND date = DATE('now')) as earnings_today
      FROM driver_campaigns dc
      JOIN campaigns c ON dc.campaign_id = c.id
      JOIN users u ON c.advertiser_id = u.id
      JOIN routes r ON c.route_id = r.id
      WHERE dc.driver_id = ? AND dc.status = 'active'
    `).all(userId, userId, userId);
    res.json(campaigns);
  });

  app.get("/api/driver/earnings-history/:userId", (req, res) => {
    const userId = req.params.userId;
    const history = db.prepare(`
      SELECT date, SUM(minutes_played) as minutes, SUM(earnings) as earnings
      FROM driver_daily_stats
      WHERE driver_id = ?
      GROUP BY date
      ORDER BY date DESC
      LIMIT 30
    `).all(userId);
    res.json(history);
  });

  app.get("/api/driver/payout-history/:userId", (req, res) => {
    const userId = req.params.userId;
    const history = db.prepare(`
      SELECT * FROM payouts WHERE user_id = ? ORDER BY created_at DESC
    `).all(userId);
    res.json(history);
  });

  app.get("/api/driver/devices/:userId", (req, res) => {
    const userId = req.params.userId;
    const devices = db.prepare(`
      SELECT * FROM devices WHERE driver_id = ? OR owner_id = ?
    `).all(userId, userId);
    res.json(devices);
  });

  app.get("/api/driver/performance/:userId", (req, res) => {
    const userId = req.params.userId;
    const performance = db.prepare("SELECT * FROM driver_performance WHERE driver_id = ?").get(userId);
    const history = db.prepare("SELECT score, date FROM driver_performance_history WHERE driver_id = ? ORDER BY date ASC").all(userId);
    res.json({ performance, history });
  });

  app.get("/api/advertiser/top-drivers", (req, res) => {
    const drivers = db.prepare(`
      SELECT u.id, u.name, dp.overall_score, dp.rank_category
      FROM users u
      JOIN driver_performance dp ON u.id = dp.driver_id
      WHERE u.role = 'driver'
      ORDER BY dp.overall_score DESC
      LIMIT 10
    `).all();
    res.json(drivers);
  });

  app.post("/api/driver/withdraw", (req, res) => {
    const { userId, amount, bankName, accountNumber } = req.body;
    const user = db.prepare("SELECT balance FROM users WHERE id = ?").get(userId) as any;
    
    if (amount < MIN_PAYOUT_THRESHOLD) {
      return res.status(400).json({ error: `Minimum withdrawal amount is ₦${MIN_PAYOUT_THRESHOLD.toLocaleString()}` });
    }

    if (user.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    db.transaction(() => {
      db.prepare("UPDATE users SET balance = balance - ? WHERE id = ?").run(amount, userId);
      db.prepare("INSERT INTO payouts (user_id, amount, bank_name, account_number, status) VALUES (?, ?, ?, ?, ?)")
        .run(userId, amount, bankName, accountNumber, 'paid');
      db.prepare("INSERT INTO wallet_transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)")
        .run(userId, -amount, 'payout', `Withdrawal to ${bankName}`);
    })();

    res.json({ success: true });
  });

  // --- Daily Settlement Simulation ---
  const runSettlement = () => {
    console.log("[SETTLEMENT] Running daily settlement simulation...");
    const stats = db.prepare("SELECT * FROM driver_daily_stats WHERE date = DATE('now')").all() as any[];
    
    db.transaction(() => {
      for (const stat of stats) {
        // 1. Credit Driver
        db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(stat.earnings, stat.driver_id);
        
        // 2. Debit Advertiser (Campaign Budget)
        db.prepare("UPDATE campaigns SET budget_remaining = budget_remaining - ? WHERE id = ?")
          .run(stat.earnings, stat.campaign_id);
        
        // 3. Log Transaction
        db.prepare("INSERT INTO wallet_transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)")
          .run(stat.driver_id, stat.earnings, 'deposit', `Daily Earnings Settlement`);

        // 4. Auto-Payout Trigger (if balance > 20,000)
        const updatedUser = db.prepare("SELECT balance FROM users WHERE id = ?").get(stat.driver_id) as any;
        const AUTO_PAYOUT_THRESHOLD = 20000;
        if (updatedUser.balance >= AUTO_PAYOUT_THRESHOLD) {
          const payoutAmount = updatedUser.balance;
          db.prepare("UPDATE users SET balance = 0 WHERE id = ?").run(stat.driver_id);
          db.prepare("INSERT INTO payouts (user_id, amount, bank_name, account_number, status) VALUES (?, ?, ?, ?, ?)")
            .run(stat.driver_id, payoutAmount, 'Auto-Payout (Default Bank)', '8123456789', 'paid');
          db.prepare("INSERT INTO wallet_transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)")
            .run(stat.driver_id, -payoutAmount, 'payout', `Auto-payout triggered (Threshold: ₦${AUTO_PAYOUT_THRESHOLD.toLocaleString()})`);
          console.log(`[SETTLEMENT] Auto-payout triggered for Driver ${stat.driver_id}: ₦${payoutAmount.toLocaleString()}`);
        }
      }
      
      // Clear stats for the day to avoid double counting if run again
      db.prepare("DELETE FROM driver_daily_stats WHERE date = DATE('now')").run();
    })();
    console.log(`[SETTLEMENT] Processed ${stats.length} records.`);
  };

  // Run every 10 minutes for demo purposes
  setInterval(runSettlement, 10 * 60 * 1000);

  app.post("/api/payouts", (req, res) => {
    const { user_id, amount, bank_name, account_number } = req.body;
    db.prepare("INSERT INTO payouts (user_id, amount, bank_name, account_number) VALUES (?, ?, ?, ?)")
      .run(user_id, amount, bank_name, account_number);
    res.json({ success: true });
  });

  app.get("/api/devices", (req, res) => {
    const devices = db.prepare("SELECT * FROM devices").all();
    res.json(devices);
  });

  app.get("/api/ads/active", (req, res) => {
    const { lat, lng } = req.query;
    const ads = db.prepare(`
      SELECT a.*, c.name as campaign_name, c.geofence_lat, c.geofence_lng, c.geofence_radius
      FROM ads a
      JOIN campaigns c ON a.campaign_id = c.id
      WHERE c.status = 'active' AND a.approval_status = 'approved'
    `).all() as any[];

    const filteredAds = ads.filter(ad => {
      if (!lat || !lng) return true;
      const dist = Math.sqrt(
        Math.pow(Number(lat) - ad.geofence_lat, 2) + 
        Math.pow(Number(lng) - ad.geofence_lng, 2)
      ) * 111000; // rough conversion to meters
      return dist <= ad.geofence_radius;
    });

    res.json(filteredAds);
  });

  // --- Admin Dashboard API ---

  app.get("/api/admin/overview", (req, res) => {
    const stats = {
      totalAdvertisers: db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'advertiser'").get() as any,
      totalDrivers: db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'driver'").get() as any,
      activeCampaigns: db.prepare("SELECT COUNT(*) as count FROM campaigns WHERE status = 'active'").get() as any,
      activeVehicles: db.prepare("SELECT COUNT(*) as count FROM devices WHERE status = 'online'").get() as any,
      revenueToday: db.prepare("SELECT SUM(amount) as total FROM wallet_transactions WHERE type = 'spend' AND timestamp >= date('now')").get() as any,
      pendingPayouts: db.prepare("SELECT SUM(amount) as total FROM payouts WHERE status = 'pending'").get() as any,
      totalImpressions: db.prepare("SELECT SUM(estimated_passengers) as total FROM impressions WHERE is_verified = 1").get() as any,
    };

    const revenueTrend = db.prepare(`
      SELECT date(timestamp) as date, SUM(ABS(amount)) as revenue
      FROM wallet_transactions 
      WHERE type = 'spend'
      GROUP BY date(timestamp)
      ORDER BY date ASC
      LIMIT 30
    `).all();

    const routePerformance = db.prepare(`
      SELECT r.name, COUNT(d.id) as active_screens
      FROM routes r
      LEFT JOIN campaigns c ON r.id = c.route_id
      LEFT JOIN driver_campaigns dc ON c.id = dc.campaign_id
      LEFT JOIN devices d ON dc.driver_id = d.driver_id
      WHERE d.status = 'online'
      GROUP BY r.id
    `).all();

    res.json({
      metrics: {
        advertisers: stats.totalAdvertisers.count,
        drivers: stats.totalDrivers.count,
        campaigns: stats.activeCampaigns.count,
        vehicles: stats.activeVehicles.count,
        revenueToday: Math.abs(stats.revenueToday.total || 0),
        pendingPayouts: stats.pendingPayouts.total || 0,
        totalImpressions: stats.totalImpressions.total || 0,
      },
      revenueTrend,
      routePerformance
    });
  });

  app.get("/api/admin/advertisers", (req, res) => {
    const advertisers = db.prepare(`
      SELECT u.*, 
             (SELECT COUNT(*) FROM campaigns WHERE advertiser_id = u.id) as campaign_count,
             (SELECT SUM(budget) FROM campaigns WHERE advertiser_id = u.id) as total_budget
      FROM users u
      WHERE u.role = 'advertiser'
      ORDER BY u.created_at DESC
    `).all();
    res.json(advertisers);
  });

  app.post("/api/admin/users/:id/status", (req, res) => {
    const { status } = req.body; // In a real app we'd have a status column, let's assume 'active' or 'suspended'
    // For now we'll just log it or we could add a column. Let's add a column to users.
    try {
      db.prepare("UPDATE users SET subscription_tier = ? WHERE id = ?").run(status === 'suspended' ? 'suspended' : 'growth', req.params.id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to update status" });
    }
  });

  app.get("/api/admin/drivers", (req, res) => {
    const drivers = db.prepare(`
      SELECT u.*, dp.overall_score, dp.rank_category,
             (SELECT COUNT(*) FROM driver_campaigns WHERE driver_id = u.id) as campaigns_accepted,
             d.device_id, d.status as device_status, d.last_lat, d.last_lng
      FROM users u
      LEFT JOIN driver_performance dp ON u.id = dp.driver_id
      LEFT JOIN devices d ON u.id = d.driver_id
      WHERE u.role = 'driver'
      ORDER BY u.created_at DESC
    `).all();
    res.json(drivers);
  });

  app.get("/api/admin/campaigns", (req, res) => {
    const campaigns = db.prepare(`
      SELECT c.*, u.name as advertiser_name, r.name as route_name,
             (SELECT SUM(estimated_passengers) FROM impressions WHERE campaign_id = c.id AND is_verified = 1) as total_impressions,
             (SELECT COUNT(*) FROM impressions WHERE campaign_id = c.id AND is_verified = 1) as total_minutes
      FROM campaigns c
      JOIN users u ON c.advertiser_id = u.id
      JOIN routes r ON c.route_id = r.id
      ORDER BY c.created_at DESC
    `).all();
    res.json(campaigns);
  });

  app.post("/api/admin/campaigns/:id/status", (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE campaigns SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/admin/notifications", (req, res) => {
    // Mock notifications
    const notifications = [
      { id: 1, type: 'subscription', message: 'New Growth subscription from Glo Mobile', time: '2 mins ago' },
      { id: 2, type: 'campaign', message: 'Campaign "Indomie Morning Rush" reached 50% budget', time: '1 hour ago' },
      { id: 3, type: 'alert', message: 'Vehicle DF-2026-001 is off-route in Ikeja', time: '15 mins ago' },
      { id: 4, type: 'payment', message: 'Withdrawal request of ₦45,000 from Emeka Nwosu', time: '3 hours ago' },
    ];
    res.json(notifications);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "custom", // Use custom to handle index.html manually
      });
      app.use(vite.middlewares);
      
      app.get("*", async (req, res, next) => {
        const url = req.originalUrl;
        try {
          let template = fs.readFileSync(path.resolve("index.html"), "utf-8");
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ "Content-Type": "text/html" }).end(template);
        } catch (e: any) {
          vite.ssrFixStacktrace(e);
          next(e);
        }
      });
      console.log('[VITE] Vite middleware integrated with custom SPA fallback');
    } catch (err) {
      console.error('[VITE] Failed to create Vite server:', err);
    }
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] DanfoDrive Backend listening on http://0.0.0.0:${PORT}`);
    console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

console.log('[SERVER] Starting DanfoDrive Application...');
startServer().catch(err => {
  console.error('[SERVER] Fatal error during startup:', err);
});
