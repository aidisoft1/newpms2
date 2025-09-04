# PostgreSQL 切换说明

## 步骤
1. 安装或启动 PostgreSQL (本地 / Docker)
2. 创建数据库 (例如 property_db) 与用户，授予权限
3. 复制 .env.example 为 .env 并修改用户/密码
4. 执行迁移
```
npx prisma migrate dev --name init_postgres
```
   若仅想快速生成表：
```
npx prisma db push
```
5. 生成客户端
```
npx prisma generate
```
6. 启动后端 (prod 构建或 dev)：
```
npm run dev
```
7. 验证：访问 http://localhost:4000/health ；再调用 /api/area2

## 数据迁移（旧 SQLite -> PostgreSQL）
若旧 SQLite 有数据 (dev.db)，可临时保留旧 schema.prisma 另存为 schema_sqlite.prisma：
```
# schema_sqlite.prisma 中 datasource 使用 sqlite
npx prisma generate --schema=schema_sqlite.prisma
# 写脚本读取旧库并写入新库
```
示例脚本逻辑：
```ts
import {PrismaClient as Pg} from '@prisma/client'
import {PrismaClient as Sqlite} from './generated/sqlite' // 需单独生成

(async()=>{
  const pg = new Pg();
  const sqlite = new Sqlite();
  const areas = await sqlite.area.findMany();
  for (const a of areas) {
    await pg.area.upsert({
      where:{ code: a.code },
      update:{ name:a.name, description:a.description },
      create:{ code:a.code, name:a.name, description:a.description,
        lowBuildingCount:a.lowBuildingCount, highBuildingCount:a.highBuildingCount,
        buildArea:a.buildArea, landArea:a.landArea, publicArea:a.publicArea,
        greenArea:a.greenArea, roadArea:a.roadArea, parkingArea:a.parkingArea,
        garageArea:a.garageArea }
    })
  }
  await pg.$disconnect();
  await sqlite.$disconnect();
})();
```

## 常见问题
- 错误: password authentication failed → 检查用户/密码与 pg_hba.conf
- FATAL: database "property_db" does not exist → 先手动创建数据库
- Prisma migrate 失败：删除已生成 migrations 目录后重新 migrate dev（仅开发期）

## 生产建议
- 建立定期备份 (pg_dump)
- 打开连接池监控 (Prisma 默认即可)
- 按查询频率增加索引 (例如 area.code 已 unique)
