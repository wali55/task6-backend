const express = require("express");
const {
  getAllPresentations,
  createNewPresentation,
  getSinglePresentation,
  updateUserRole,
} = require("../controllers/presentationsController");

const router = express.Router();

router.get("/", getAllPresentations);
router.get("/:id", getSinglePresentation);
router.post("/", createNewPresentation);
router.put('/:presentationId/users/:targetUserId/role', updateUserRole);

module.exports = router;
