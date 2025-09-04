-- CreateTable
CREATE TABLE "public"."Area" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "lowBuildingCount" INTEGER NOT NULL DEFAULT 0,
    "highBuildingCount" INTEGER NOT NULL DEFAULT 0,
    "buildArea" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "landArea" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "publicArea" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "greenArea" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "roadArea" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "parkingArea" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "garageArea" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Area_code_key" ON "public"."Area"("code");
