const { PrismaClient } = require('@prisma/client');

async function main() {
  const p = new PrismaClient();
  try {
    // 列出 public 下的表
    const tables = await p.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
    const names = tables.map(t => t.table_name);
    const result = {};
    // 针对已知模型安全计数
    for (const n of names) {
      try {
        if (n === 'Area') result.Area = await p.area.count();
        else if (n === 'Building') result.Building = await p.building.count();
        else if (n === 'Room') result.Room = await p.room.count();
      } catch (e) {
        result[n] = 'count_error';
      }
    }
    console.log('Tables in public:', names);
    console.log('Row counts:', result);
  } catch (e) {
    console.error('DB STATUS ERROR:', e);
  } finally {
    await p.$disconnect();
  }
}

main();