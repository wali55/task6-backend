const express = require("express");
const {
  getAllPresentations,
  createNewPresentation,
  getSinglePresentation,
} = require("../controllers/presentationsController");

const router = express.Router();

router.get("/", getAllPresentations);
router.get("/:id", getSinglePresentation);
router.post("/", createNewPresentation);

module.exports = router;
