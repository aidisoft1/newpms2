"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    // 如果已经有数据则跳过
    const areaCount = await prisma.area.count();
    if (areaCount > 0) {
        console.log('Seed skipped: area table not empty');
        return;
    }
    console.log('Seeding initial data...');
    const area = await prisma.area.create({
        data: {
            name: '示例管理区',
            code: 'AREA-001',
            description: '初始化示例',
            lowBuildingCount: 2,
            highBuildingCount: 1,
            buildArea: 12000,
            landArea: 8000,
            publicArea: 1000,
            greenArea: 500,
            roadArea: 600,
            parkingArea: 300,
            garageArea: 200
        }
    });
    const b1 = await prisma.building.create({
        data: { name: '1号楼', code: 'BLD-1', areaId: area.id, floors: 6, units: 2, buildArea: 4000 }
    });
    const b2 = await prisma.building.create({
        data: { name: '2号楼', code: 'BLD-2', areaId: area.id, floors: 6, units: 2, buildArea: 4000 }
    });
    await prisma.room.createMany({
        data: [
            { roomNo: '101', code: 'RM-1-101', areaId: area.id, buildingId: b1.id, floor: 1, unit: 1, size: 90 },
            { roomNo: '102', code: 'RM-1-102', areaId: area.id, buildingId: b1.id, floor: 1, unit: 1, size: 92 },
            { roomNo: '201', code: 'RM-2-201', areaId: area.id, buildingId: b2.id, floor: 2, unit: 1, size: 95 }
        ]
    });
    console.log('Seed data inserted.');
}
main().catch(e => {
    console.error('Seed error', e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
