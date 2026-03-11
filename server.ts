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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER,
    vehicle_type TEXT,
    vehicle_reg TEXT,
    status TEXT DEFAULT 'offline',
    last_lat REAL,
    last_lng REAL,
    last_heartbeat DATETIME,
    FOREIGN KEY(owner_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    advertiser_id INTEGER,
    name TEXT,
    budget REAL,
    cpm_rate REAL,
    status TEXT DEFAULT 'active',
    geofence_lat REAL,
    geofence_lng REAL,
    geofence_radius REAL, -- in meters
    start_date DATETIME,
    end_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(advertiser_id) REFERENCES users(id)
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
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    lat REAL,
    lng REAL,
    estimated_passengers INTEGER DEFAULT 1,
    status TEXT DEFAULT 'confirmed',
    FOREIGN KEY(device_id) REFERENCES devices(id),
    FOREIGN KEY(ad_id) REFERENCES ads(id)
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

  CREATE TABLE IF NOT EXISTS qr_scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    impression_id INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_ip TEXT,
    reward_type TEXT,
    FOREIGN KEY(impression_id) REFERENCES impressions(id)
  );
`);

// Migration: Ensure columns exist (in case DB was created with older schema)
try { db.exec("ALTER TABLE users ADD COLUMN balance REAL DEFAULT 0"); } catch (e) {}
try { db.exec("ALTER TABLE campaigns ADD COLUMN created_at DATETIME DEFAULT '2026-01-01 00:00:00'"); } catch (e) {}
try { db.exec("ALTER TABLE ads ADD COLUMN approval_status TEXT DEFAULT 'pending'"); } catch (e) {}

// Seed some data if empty
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  db.prepare("INSERT INTO users (email, role, name, balance) VALUES (?, ?, ?, ?)").run("advertiser@example.com", "advertiser", "Tunde Okafor", 124500);
  db.prepare("INSERT INTO users (email, role, name, balance) VALUES (?, ?, ?, ?)").run("driver@example.com", "driver", "Emeka Nwosu", 24500);
  
  db.prepare("INSERT INTO devices (owner_id, vehicle_type, vehicle_reg, status, last_lat, last_lng) VALUES (?, ?, ?, ?, ?, ?)")
    .run(2, "Danfo", "LAG-123-XY", "online", 6.5244, 3.3792);

  db.prepare("INSERT INTO campaigns (advertiser_id, name, budget, cpm_rate, geofence_lat, geofence_lng, geofence_radius) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(1, "Indomie Morning Rush", 50000, 50, 6.5244, 3.3792, 5000);
    
  // Approved Ad
  db.prepare("INSERT INTO ads (campaign_id, asset_url, qr_code_data, approval_status) VALUES (?, ?, ?, ?)")
    .run(1, "https://picsum.photos/seed/indomie/800/450", "REWARD_DATA_50MB", "approved");

  // Pending Ad for Admin Demo
  db.prepare("INSERT INTO ads (campaign_id, asset_url, qr_code_data, approval_status) VALUES (?, ?, ?, ?)")
    .run(1, "https://picsum.photos/seed/coke/800/450", "COKE_REWARD", "pending");

  // Seed some impressions for proof of play
  db.prepare("INSERT INTO impressions (device_id, ad_id, lat, lng, estimated_passengers) VALUES (?, ?, ?, ?, ?)")
    .run(1, 1, 6.5244, 3.3792, 12);
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
      SELECT c.*, COUNT(a.id) as ad_count 
      FROM campaigns c 
      LEFT JOIN ads a ON c.id = a.campaign_id 
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `).all();
    res.json(campaigns);
  });

  app.post("/api/campaigns", (req, res) => {
    const { advertiser_id, name, budget, cpm_rate, geofence_lat, geofence_lng, geofence_radius } = req.body;
    const result = db.prepare(`
      INSERT INTO campaigns (advertiser_id, name, budget, cpm_rate, geofence_lat, geofence_lng, geofence_radius)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(advertiser_id || 1, name, budget, cpm_rate, geofence_lat, geofence_lng, geofence_radius);
    res.json({ id: result.lastInsertRowid });
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

  app.get("/api/driver/stats/:userId", (req, res) => {
    const stats = db.prepare(`
      SELECT u.balance, 
             (SELECT SUM(amount) FROM payouts WHERE user_id = u.id AND status = 'paid') as total_paid
      FROM users u
      WHERE u.id = ?
    `).get(req.params.userId);
    res.json(stats);
  });

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

  // Admin Dashboard Stats
  app.get("/api/admin/stats", (req, res) => {
    const stats = {
      totalScreens: db.prepare("SELECT COUNT(*) as count FROM devices").get() as any,
      onlineDevices: db.prepare("SELECT COUNT(*) as count FROM devices WHERE status = 'online'").get() as any,
      offlineDevices: db.prepare("SELECT COUNT(*) as count FROM devices WHERE status = 'offline'").get() as any,
      monthlyRevenue: 1250000, // Mock revenue
    };
    res.json({
      totalScreens: stats.totalScreens.count,
      onlineDevices: stats.onlineDevices.count,
      offlineDevices: stats.offlineDevices.count,
      monthlyRevenue: stats.monthlyRevenue
    });
  });

  // IoT Device Monitor
  app.get("/api/admin/devices", (req, res) => {
    const devices = db.prepare(`
      SELECT d.*, u.name as driver_name 
      FROM devices d 
      LEFT JOIN users u ON d.driver_id = u.id
    `).all();
    res.json(devices);
  });

  // Payout Management
  app.get("/api/admin/payouts/eligible", (req, res) => {
    const eligible = db.prepare(`
      SELECT u.id, u.name, u.balance, u.bank_name, u.account_number
      FROM users u
      WHERE u.role = 'driver' AND u.balance >= 20000
    `).all();
    res.json(eligible);
  });

  // Ad Approval Queue
  app.get("/api/admin/ads/pending", (req, res) => {
    const ads = db.prepare(`
      SELECT a.*, c.name as campaign_name, u.name as advertiser_name
      FROM ads a
      JOIN campaigns c ON a.campaign_id = c.id
      JOIN users u ON c.advertiser_id = u.id
      WHERE a.approval_status = 'pending'
    `).all();
    res.json(ads);
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
