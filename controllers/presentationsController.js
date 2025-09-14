const prisma = require("../config/database");

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
      include: { creator: true }
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

module.exports = {getAllPresentations, createNewPresentation, getSinglePresentation}