const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

module.exports = prisma;