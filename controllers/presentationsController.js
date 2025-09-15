const prisma = require("../config/database");
const userRole = require("../config/userRole");

const getAllPresentations = async (req, res) => {
  try {
    const presentations = await prisma.presentation.findMany({
      include: { creator: true },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(presentations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getSinglePresentation = async (req, res) => {
  try {
    const {id} = req.params;
    const presentation = await prisma.presentation.findUnique({
      where: {id},
      include: { creator: true, slides: true }
    });
    res.json(presentation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const createNewPresentation = async (req, res) => {
  const { title, creatorId } = req.body;
  try {
    const presentation = await prisma.presentation.create({
      data: { title, creatorId },
      include: { creator: true }
    });
    res.json(presentation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const updateUserRole = async (req, res) => {
  try {
    const { presentationId, targetUserId } = req.params;
    const { userId, role } = req.body;

    const requesterSession = await prisma.presentationSession.findUnique({
      where: { presentationId_userId: { presentationId, userId } },
      select: { role: true }
    });

    if (requesterSession?.role !== userRole.CREATOR) {
      return res.status(403).json({ error: 'Only creators can change roles' });
    }

    const updatedSession = await prisma.presentationSession.update({
      where: { presentationId_userId: { presentationId, userId: targetUserId } },
      data: { role },
      include: { user: true }
    });

    res.json(updatedSession);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {getAllPresentations, createNewPresentation, getSinglePresentation, updateUserRole}