// controllers/examController.js
exports.getExams = (req, res) => {
  res.json([
    { id: 1, titulo: "Examen de Matemáticas" },
    { id: 2, titulo: "Examen de Historia" }
  ]);
};