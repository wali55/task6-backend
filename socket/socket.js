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

        socket.emit("presentation-state", {
          presentation,
          slides: presentation.slides
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

    socket.on("add-text-block", async (data) => {
      const { presentationId, slideId, textBlock } = data;
      try {
        const slide = await prisma.slide.findUnique({
          where: { id: slideId, presentationId }
        });

        if (!slide) {
          return socket.emit("error", { message: "Slide not found" });
        }

        const content = slide.content || { elements: [] };
        const newBlock = {
          id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'text',
          x: textBlock.x || 100,
          y: textBlock.y || 100,
          width: textBlock.width || 200,
          height: textBlock.height || 100,
          content: textBlock.content || 'New text block',
          style: textBlock.style || {}
        };

        content.elements = [...(content.elements || []), newBlock];

        await prisma.slide.update({
          where: { id: slideId },
          data: { content }
        });

        io.to(presentationId).emit("text-block-added", {
          slideId,
          textBlock: newBlock
        });
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("update-text-block", async (data) => {
      const { presentationId, slideId, blockId, updates } = data;
      try {
        const slide = await prisma.slide.findUnique({
          where: { id: slideId, presentationId }
        });

        if (!slide) {
          return socket.emit("error", { message: "Slide not found" });
        }

        const content = slide.content || { elements: [] };
        const blockIndex = content.elements.findIndex(el => el.id === blockId);

        if (blockIndex === -1) {
          return socket.emit("error", { message: "Text block not found" });
        }

        content.elements[blockIndex] = {
          ...content.elements[blockIndex],
          ...updates
        };

        await prisma.slide.update({
          where: { id: slideId },
          data: { content }
        });

        io.to(presentationId).emit("text-block-updated", {
          slideId,
          blockId,
          updates
        });
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("delete-text-block", async (data) => {
      const { presentationId, slideId, blockId } = data;
      try {
        const slide = await prisma.slide.findUnique({
          where: { id: slideId, presentationId }
        });

        if (!slide) {
          return socket.emit("error", { message: "Slide not found" });
        }

        const content = slide.content || { elements: [] };
        content.elements = content.elements.filter(el => el.id !== blockId);

        await prisma.slide.update({
          where: { id: slideId },
          data: { content }
        });

        io.to(presentationId).emit("text-block-deleted", {
          slideId,
          blockId
        });
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("move-text-block", async (data) => {
      const { presentationId, slideId, blockId, x, y } = data;
      try {
        io.to(presentationId).emit("text-block-moved", {
          slideId,
          blockId,
          x,
          y
        });

        const slide = await prisma.slide.findUnique({
          where: { id: slideId, presentationId }
        });

        if (slide) {
          const content = slide.content || { elements: [] };
          const blockIndex = content.elements.findIndex(el => el.id === blockId);
          
          if (blockIndex !== -1) {
            content.elements[blockIndex].x = x;
            content.elements[blockIndex].y = y;
            
            await prisma.slide.update({
              where: { id: slideId },
              data: { content }
            });
          }
        }
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("add-slide", async (data) => {
      const { presentationId } = data;
      try {
        const lastSlide = await prisma.slide.findFirst({
          where: { presentationId },
          orderBy: { order: "desc" },
        });

        const slide = await prisma.slide.create({
          data: {
            presentationId,
            order: (lastSlide?.order || 0) + 1,
            content: { title: "New Slide", elements: [] },
          },
        });

        io.to(presentationId).emit("slide-added", slide);
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("delete-slide", async (data) => {
      const { presentationId, slideId } = data;
      try {
        await prisma.slide.delete({
          where: { id: slideId, presentationId },
        });

        io.to(presentationId).emit("slide-deleted", { slideId });
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("change-user-role", async (data) => {
      const { presentationId, targetUserId, role, userId } = data;
      try {
        const requesterSession = await prisma.presentationSession.findUnique({
          where: { presentationId_userId: { presentationId, userId } },
          select: { role: true },
        });

        if (requesterSession?.role !== "CREATOR") {
          return socket.emit("error", {
            message: "Only creators can change roles",
          });
        }

        const updatedSession = await prisma.presentationSession.update({
          where: {
            presentationId_userId: { presentationId, userId: targetUserId },
          },
          data: { role },
          include: { user: true },
        });

        io.to(presentationId).emit("role-changed", {
          userId: targetUserId,
          role,
          session: updatedSession,
        });
      } catch (error) {
        socket.emit("error", { message: error.message });
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

          io.to(socket.presentationId).emit("user-left", {
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
