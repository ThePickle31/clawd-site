import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Types
export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  ip_address: string | null;
  created_at: string;
  status: 'pending' | 'replied' | 'ignored';
  replied_at: string | null;
  reply_content: string | null;
}

export interface AdminSession {
  token: string;
  created_at: string;
  expires_at: string;
}

// Lazy database initialization to avoid build-time errors
let db: DatabaseType | null = null;

function getDb(): DatabaseType {
  if (db) return db;

  // Database path from env or default
  const DB_PATH = process.env.DATABASE_URL || '/data/contact.db';

  // Ensure the directory exists
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Initialize database with WAL mode for better concurrency
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      ip_address TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'replied', 'ignored')),
      replied_at TEXT,
      reply_content TEXT
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      created_at TEXT DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rate_limits (
      ip_address TEXT PRIMARY KEY,
      request_count INTEGER DEFAULT 1,
      window_start TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_messages_status ON contact_messages(status);
    CREATE INDEX IF NOT EXISTS idx_messages_created ON contact_messages(created_at);
    CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);
  `);

  return db;
}

// Contact Message functions
export function createMessage(name: string, email: string, message: string, ipAddress?: string): ContactMessage {
  const database = getDb();
  const stmt = database.prepare(`
    INSERT INTO contact_messages (name, email, message, ip_address)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(name, email, message, ipAddress || null);
  return getMessageById(result.lastInsertRowid as number)!;
}

export function getMessageById(id: number): ContactMessage | null {
  const database = getDb();
  const stmt = database.prepare('SELECT * FROM contact_messages WHERE id = ?');
  return stmt.get(id) as ContactMessage | null;
}

export function getPendingMessages(): ContactMessage[] {
  const database = getDb();
  const stmt = database.prepare(`
    SELECT * FROM contact_messages
    WHERE status = 'pending'
    ORDER BY created_at DESC
  `);
  return stmt.all() as ContactMessage[];
}

export function getAllMessages(): ContactMessage[] {
  const database = getDb();
  const stmt = database.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC');
  return stmt.all() as ContactMessage[];
}

export function markAsReplied(id: number, replyContent: string): void {
  const database = getDb();
  const stmt = database.prepare(`
    UPDATE contact_messages
    SET status = 'replied', replied_at = datetime('now'), reply_content = ?
    WHERE id = ?
  `);
  stmt.run(replyContent, id);
}

export function markAsIgnored(id: number): void {
  const database = getDb();
  const stmt = database.prepare(`
    UPDATE contact_messages
    SET status = 'ignored'
    WHERE id = ?
  `);
  stmt.run(id);
}

// Admin Session functions
export function createSession(token: string, expiresInHours: number = 24): AdminSession {
  const database = getDb();
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();
  const stmt = database.prepare(`
    INSERT INTO admin_sessions (token, expires_at)
    VALUES (?, ?)
  `);
  stmt.run(token, expiresAt);
  return { token, created_at: new Date().toISOString(), expires_at: expiresAt };
}

export function validateSession(token: string): boolean {
  const database = getDb();
  const stmt = database.prepare(`
    SELECT * FROM admin_sessions
    WHERE token = ? AND datetime(expires_at) > datetime('now')
  `);
  const session = stmt.get(token);
  return !!session;
}

export function deleteSession(token: string): void {
  const database = getDb();
  const stmt = database.prepare('DELETE FROM admin_sessions WHERE token = ?');
  stmt.run(token);
}

export function cleanExpiredSessions(): void {
  const database = getDb();
  const stmt = database.prepare(`DELETE FROM admin_sessions WHERE datetime(expires_at) <= datetime('now')`);
  stmt.run();
}

// Rate limiting functions (3 requests per IP per hour)
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export function checkRateLimit(ipAddress: string): { allowed: boolean; remaining: number; resetAt: Date } {
  const database = getDb();
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);

  // Clean old entries
  database.prepare(`DELETE FROM rate_limits WHERE datetime(window_start) < datetime(?)`).run(windowStart.toISOString());

  // Get current count
  const stmt = database.prepare('SELECT * FROM rate_limits WHERE ip_address = ?');
  const record = stmt.get(ipAddress) as { ip_address: string; request_count: number; window_start: string } | undefined;

  if (!record) {
    // First request in this window
    database.prepare('INSERT INTO rate_limits (ip_address, request_count, window_start) VALUES (?, 1, ?)').run(ipAddress, now.toISOString());
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX - 1,
      resetAt: new Date(now.getTime() + RATE_LIMIT_WINDOW_MS)
    };
  }

  const recordWindowStart = new Date(record.window_start);
  if (recordWindowStart < windowStart) {
    // Old window, reset
    database.prepare('UPDATE rate_limits SET request_count = 1, window_start = ? WHERE ip_address = ?').run(now.toISOString(), ipAddress);
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX - 1,
      resetAt: new Date(now.getTime() + RATE_LIMIT_WINDOW_MS)
    };
  }

  if (record.request_count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(recordWindowStart.getTime() + RATE_LIMIT_WINDOW_MS)
    };
  }

  // Increment count
  database.prepare('UPDATE rate_limits SET request_count = request_count + 1 WHERE ip_address = ?').run(ipAddress);
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX - record.request_count - 1,
    resetAt: new Date(recordWindowStart.getTime() + RATE_LIMIT_WINDOW_MS)
  };
}

export default getDb;
