-- 手动创建管理区(Area)表的 PostgreSQL 版本结构
-- 在 psql 中连接到目标数据库后执行: \i path/to/area_postgres.sql

CREATE TABLE IF NOT EXISTS "Area" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  lowBuildingCount INTEGER NOT NULL DEFAULT 0,
  highBuildingCount INTEGER NOT NULL DEFAULT 0,
  buildArea DOUBLE PRECISION NOT NULL DEFAULT 0,
  landArea DOUBLE PRECISION NOT NULL DEFAULT 0,
  publicArea DOUBLE PRECISION NOT NULL DEFAULT 0,
  greenArea DOUBLE PRECISION NOT NULL DEFAULT 0,
  roadArea DOUBLE PRECISION NOT NULL DEFAULT 0,
  parkingArea DOUBLE PRECISION NOT NULL DEFAULT 0,
  garageArea DOUBLE PRECISION NOT NULL DEFAULT 0,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- updatedAt 自动更新时间触发器（可选）
CREATE OR REPLACE FUNCTION area_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'area_set_updated_at_trg'
  ) THEN
    CREATE TRIGGER area_set_updated_at_trg
    BEFORE UPDATE ON "Area"
    FOR EACH ROW EXECUTE FUNCTION area_set_updated_at();
  END IF;
END;$$;
