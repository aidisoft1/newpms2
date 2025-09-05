-- PostgreSQL数据库初始化脚本
-- 创建数据库 (如果不存在)
-- 注意：此脚本需要在PostgreSQL管理员权限下运行

-- 创建数据库
CREATE DATABASE newpms2_dev
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Chinese (Simplified)_China.936'
    LC_CTYPE = 'Chinese (Simplified)_China.936'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- 连接到新创建的数据库
\c newpms2_dev;

-- 创建扩展 (如果需要)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建园区表
CREATE TABLE IF NOT EXISTS gardens (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建建筑表
CREATE TABLE IF NOT EXISTS buildings (
    id SERIAL PRIMARY KEY,
    garden_id INTEGER REFERENCES gardens(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    total_floors INTEGER DEFAULT 0,
    total_rooms INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建房间表
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    building_id INTEGER REFERENCES buildings(id) ON DELETE CASCADE,
    room_number VARCHAR(20) NOT NULL,
    floor INTEGER NOT NULL,
    area DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'vacant' CHECK (status IN ('vacant', 'occupied', 'maintenance')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(building_id, room_number)
);

-- 创建客户表
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    id_card VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建租约表
CREATE TABLE IF NOT EXISTS leases (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent DECIMAL(10,2) NOT NULL,
    deposit DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建费用表
CREATE TABLE IF NOT EXISTS fees (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_buildings_garden_id ON buildings(garden_id);
CREATE INDEX IF NOT EXISTS idx_rooms_building_id ON rooms(building_id);
CREATE INDEX IF NOT EXISTS idx_leases_room_id ON leases(room_id);
CREATE INDEX IF NOT EXISTS idx_leases_customer_id ON leases(customer_id);
CREATE INDEX IF NOT EXISTS idx_fees_room_id ON fees(room_id);
CREATE INDEX IF NOT EXISTS idx_fees_status ON fees(status);

-- 插入示例数据
INSERT INTO gardens (name, address, description) VALUES 
('阳光花园', '北京市朝阳区阳光大街123号', '高端住宅小区'),
('绿色家园', '北京市海淀区绿色路456号', '生态友好型社区');

INSERT INTO buildings (garden_id, name, address, total_floors, total_rooms) VALUES 
(1, 'A栋', '阳光花园A栋', 20, 160),
(1, 'B栋', '阳光花园B栋', 18, 144),
(2, 'C栋', '绿色家园C栋', 15, 120);

INSERT INTO rooms (building_id, room_number, floor, area, status) VALUES 
(1, '101', 1, 85.5, 'occupied'),
(1, '102', 1, 92.0, 'vacant'),
(1, '201', 2, 85.5, 'occupied'),
(2, '101', 1, 78.0, 'vacant'),
(2, '102', 1, 82.5, 'maintenance');

INSERT INTO customers (name, phone, email, address) VALUES 
('张三', '13800138001', 'zhangsan@email.com', '北京市朝阳区'),
('李四', '13800138002', 'lisi@email.com', '北京市海淀区'),
('王五', '13800138003', 'wangwu@email.com', '北京市西城区');

COMMENT ON DATABASE newpms2_dev IS '新物业管理系统开发数据库';
COMMENT ON TABLE users IS '用户表';
COMMENT ON TABLE gardens IS '园区表';
COMMENT ON TABLE buildings IS '建筑表';
COMMENT ON TABLE rooms IS '房间表';
COMMENT ON TABLE customers IS '客户表';
COMMENT ON TABLE leases IS '租约表';
COMMENT ON TABLE fees IS '费用表';
