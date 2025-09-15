const { PrismaClient } = require("../generated/prisma");

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

module.exports = prisma;