const express = require('express');
const { addSlide, deleteSlide } = require('../controllers/slidesController');
const router = express.Router();

router.post('/:presentationId/slides', addSlide);
router.delete('/:presentationId/slides/:slideId', deleteSlide);

module.exports = router;