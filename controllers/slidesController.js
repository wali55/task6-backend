const prisma = require("../config/database");

const addSlide = async (req, res) => {
  try {
    const { presentationId } = req.params;

    const lastSlide = await prisma.slide.findFirst({
      where: { presentationId },
      orderBy: { order: 'desc' }
    });

    const slide = await prisma.slide.create({
      data: {
        presentationId,
        order: (lastSlide?.order || 0) + 1,
        content: { title: 'New Slide', elements: [] }
      }
    });

    res.json(slide);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const deleteSlide = async (req, res) => {
  try {
    const { slideId } = req.params;

    await prisma.slide.delete({
      where: { id: slideId }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {addSlide, deleteSlide}