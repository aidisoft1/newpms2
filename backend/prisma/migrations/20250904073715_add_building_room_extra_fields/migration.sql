-- AlterTable
ALTER TABLE "public"."Building" ADD COLUMN     "address" TEXT,
ADD COLUMN     "buildingStructure" TEXT,
ADD COLUMN     "buildingType" TEXT,
ADD COLUMN     "orientation" TEXT,
ADD COLUMN     "remark" TEXT;

-- AlterTable
ALTER TABLE "public"."Room" ADD COLUMN     "remark" TEXT;
