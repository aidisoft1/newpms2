const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
async function main(){
  const p = new PrismaClient()
  const sql = fs.readFileSync('prisma/migrations/20250904_add_building_room_extra_fields/migration.sql','utf8')
  const statements = sql.split(/;\s*/).map(s=>s.trim()).filter(Boolean)
  for (const stmt of statements) {
    console.log('Executing:', stmt)
    await p.$executeRawUnsafe(stmt)
  }
  console.log('All manual column additions applied.')
  await p.$disconnect()
}
main().catch(e=>{console.error(e);process.exit(1)})
