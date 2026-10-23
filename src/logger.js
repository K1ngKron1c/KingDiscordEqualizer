import fs from 'node:fs';
import path from 'node:path';
import util from 'node:util';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, '..', 'logs');
fs.mkdirSync(logsDir, { recursive: true });

const pad = (n) => String(n).padStart(2, '0');

// Local date, e.g. 2026-10-23
const dateStamp = (d = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Local time, e.g. 2026-10-23 01:04:12
const timeStamp = (d = new Date()) =>
  `${dateStamp(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

// New file every 24 hours, counted from when the file was started
// e.g. logs/2026-10-23_01-04-12.log, then 24h later logs/2026-10-24_01-04-12.log
const ROTATE_MS = 24 * 60 * 60 * 1000;
let currentFile = null;
let fileStartedAt = 0;

const logPath = () => {
  const now = Date.now();
  if (!currentFile || now - fileStartedAt >= ROTATE_MS) {
    const d = new Date(now);
    const name = `${dateStamp(d)}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}.log`;
    currentFile = path.join(logsDir, name);
    fileStartedAt = now;
  }
  return currentFile;
};

function write(level, args) {
  const line = `[${timeStamp()}] [${level}] ${util.format(...args)}\n`;
  fs.appendFile(logPath(), line, () => {});
}

for (const [method, level] of [
  ['log', 'INFO'],
  ['info', 'INFO'],
  ['warn', 'WARN'],
  ['error', 'ERROR'],
]) {
  const original = console[method].bind(console);
  console[method] = (...args) => {
    original(...args);
    write(level, args);
  };
}

// Logged the moment the bot process starts
console.log(`===== Bot starting (pid ${process.pid}, node ${process.version}) =====`);

process.on('exit', (code) => {
  write('INFO', [`===== Bot stopped (exit code ${code}) =====`]);
});

// Call this whenever a song starts: logSong('Hit the Boulevard', 'Soudiere, Dj Smokey')
export function logSong(title, artist = '') {
  console.log(`Now playing: ${title}${artist ? ' - ' + artist : ''}`);
}

process.on('uncaughtException', (err) => {
  write('FATAL', [err.stack || err]);
  console.error(err);
});

process.on('unhandledRejection', (reason) => {
  write('ERROR', ['Unhandled rejection:', reason?.stack || reason]);
});