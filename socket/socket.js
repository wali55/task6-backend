const prisma = require("../config/database");
const userRole = require("../config/userRole");

const setupSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("join-presentation", async (data) => {
      const { presentationId, userId, nickname } = data;

      try {
        const presentation = await prisma.presentation.findUnique({
          where: { id: presentationId },
          select: { creatorId: true },
        });

        if (!presentation) {
          return socket.emit("error", { message: "Presentation not found" });
        }

        let role =
          presentation.creatorId === userId
            ? userRole.CREATOR
            : userRole.VIEWER;

        await prisma.presentationSession.upsert({
          where: {
            presentationId_userId: { presentationId, userId },
          },
          update: {
            isActive: true,
            nickname,
            role,
          },
          create: {
            presentationId,
            userId,
            nickname,
            role,
            isActive: true,
          },
        });

        socket.join(presentationId);
        socket.presentationId = presentationId;
        socket.userId = userId;

        const activeUsers = await prisma.presentationSession.findMany({
          where: { presentationId, isActive: true },
          include: { user: true },
        });

        io.to(presentationId).emit("user-joined", {
          userId,
          nickname,
          activeUsers,
        });
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("leave-presentation", async (data) => {
      const { presentationId, userId } = data;
      try {
        const presentation = await prisma.presentation.findUnique({
          where: { id: presentationId },
          select: { creatorId: true },
        });

        if (!presentation) {
          return socket.emit("error", { message: "Presentation not found" });
        }

        await prisma.presentationSession.update({
          where: {
            presentationId_userId: { presentationId, userId },
          },
          data: {
            isActive: false,
          },
        });

        const activeUsers = await prisma.presentationSession.findMany({
          where: { presentationId: presentationId, isActive: true },
          include: { user: true },
        });

        io.to(presentationId).emit("user-left-presentation", {
          userId: userId,
          activeUsers,
        });
      } catch (error) {
        socket.emit("error", { message: error.message });
        console.error("Leave-presentation error:", error);
      }
    });

    socket.on("disconnecting", async () => {
      if (socket.presentationId && socket.userId) {
        try {
          await prisma.presentationSession.updateMany({
            where: {
              presentationId: socket.presentationId,
              userId: socket.userId,
            },
            data: { isActive: false },
          });

          const activeUsers = await prisma.presentationSession.findMany({
            where: { presentationId: socket.presentationId, isActive: true },
            include: { user: true },
          });

          socket.to(socket.presentationId).emit("user-left", {
            userId: socket.userId,
            activeUsers,
          });
        } catch (error) {
          console.error("Disconnecting error:", error);
        }
      }
    });
  });
};

module.exports = setupSocket;
