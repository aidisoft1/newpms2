// Quick Prisma / PostgreSQL connectivity check and basic counts
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

(async () => {
  const url = process.env.DATABASE_URL;
  console.log('[prismaCheck] DATABASE_URL =', url || '(not set)');
  if (!url) {
    console.error('[prismaCheck] Missing DATABASE_URL in .env');
    process.exit(2);
  }
  const prisma = new PrismaClient();
  const started = Date.now();
  try {
    // Simple query to ensure connection
    const ver = await prisma.$queryRaw`select version()`;
    console.log('[prismaCheck] Connected. Postgres version:', ver && ver[0] && ver[0].version);
    const counts = {};
    try { counts.areas = await prisma.area.count(); } catch (e) { counts.areas = 'err:' + (e.code || e.message); }
    try { counts.buildings = await prisma.building.count(); } catch (e) { counts.buildings = 'err:' + (e.code || e.message); }
    try { counts.rooms = await prisma.room.count(); } catch (e) { counts.rooms = 'err:' + (e.code || e.message); }
    console.log('[prismaCheck] Counts:', counts);
    console.log('[prismaCheck] OK in', Date.now() - started, 'ms');
    process.exit(0);
  } catch (e) {
    console.error('[prismaCheck] Connection failed:', e.code || e.message, e);
    console.error('Common fixes:');
    console.error('  P1000: Auth failed -> check user/password');
    console.error('  P1001: Database unreachable -> check host/port/service, ensure PostgreSQL running');
    console.error('  ECONNREFUSED: Port not listening -> verify postgres is started');
    process.exit(1);
  } finally {
    try { await prisma.$disconnect(); } catch {}
  }
})();
