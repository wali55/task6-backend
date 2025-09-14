const prisma = require("../config/database");

const createUser = async (req, res) => {
  try {
    const { nickname } = req.body;

    let user = await prisma.user.findFirst({
      where: { nickname },
    });

    const existed = !!user;

    if (!user) {
      user = await prisma.user.create({
        data: { nickname },
      });
    }

    return res.json({
      nickname,
      userId: user.id,
      isReturning: !!existed,
    });
  } catch (error) {
    return res.status(500).json("Failed to create user", error);
  }
};

module.exports = {createUser}
