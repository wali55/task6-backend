-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('CREATOR', 'EDITOR', 'VIEWER');

-- CreateTable
CREATE TABLE "public"."Presentation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "Presentation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PresentationSession" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "presentationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PresentationSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PresentationSession_presentationId_userId_key" ON "public"."PresentationSession"("presentationId", "userId");

-- AddForeignKey
ALTER TABLE "public"."Presentation" ADD CONSTRAINT "Presentation_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PresentationSession" ADD CONSTRAINT "PresentationSession_presentationId_fkey" FOREIGN KEY ("presentationId") REFERENCES "public"."Presentation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PresentationSession" ADD CONSTRAINT "PresentationSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
