const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getExams,
  getExamById,
  submitExam
} = require("../controllers/examController");

// Todas las rutas de exámenes requieren autenticación
router.get("/", auth, getExams);
router.get("/:id", auth, getExamById);
router.post("/submit", auth, submitExam);

module.exports = router;
