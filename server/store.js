import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "data", "db.json");

function ensureDir() {
  const dir = dirname(DB_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function readDB() {
  ensureDir();
  if (!existsSync(DB_PATH)) {
    const initial = { users: {} };
    writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    return JSON.parse(readFileSync(DB_PATH, "utf-8"));
  } catch {
    const initial = { users: {} };
    writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
}

function writeDB(data) {
  ensureDir();
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function getUser(userId) {
  const db = readDB();
  return db.users[userId] || null;
}

export function getUserByHandle(handle) {
  const db = readDB();
  return Object.values(db.users).find(
    (u) => u.handle.toLowerCase() === handle.toLowerCase()
  );
}

export function createUser(user) {
  const db = readDB();
  db.users[user.id] = user;
  writeDB(db);
  return user;
}

export function updateUser(userId, data) {
  const db = readDB();
  if (!db.users[userId]) return null;
  db.users[userId] = { ...db.users[userId], ...data, updatedAt: new Date().toISOString() };
  writeDB(db);
  return db.users[userId];
}

export function deleteUser(userId) {
  const db = readDB();
  delete db.users[userId];
  writeDB(db);
}
