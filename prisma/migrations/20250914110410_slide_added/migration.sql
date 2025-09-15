-- CreateTable
CREATE TABLE "public"."Slide" (
    "id" TEXT NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{}',
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "presentationId" TEXT NOT NULL,

    CONSTRAINT "Slide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Slide_presentationId_order_key" ON "public"."Slide"("presentationId", "order");

-- AddForeignKey
ALTER TABLE "public"."Slide" ADD CONSTRAINT "Slide_presentationId_fkey" FOREIGN KEY ("presentationId") REFERENCES "public"."Presentation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
