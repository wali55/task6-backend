-- AlterTable
ALTER TABLE "public"."Presentation" ADD COLUMN     "currentSlideId" TEXT,
ADD COLUMN     "isPresentMode" BOOLEAN NOT NULL DEFAULT false;
