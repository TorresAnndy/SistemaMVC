const db = require("../config/db");

// LISTAR EXÁMENES
exports.getExams = (req, res) => {
  db.query("SELECT id, title, description, created_at FROM exams", (err, results) => {
    if (err) return res.status(500).json({ msg: "Error al obtener exámenes" });
    res.json(results);
  });
};

// EXAMEN COMPLETO (sin exponer is_correct al cliente)
exports.getExamById = (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ msg: "ID inválido" });
  }

  const query = `
    SELECT 
      e.id AS exam_id,
      e.title,
      e.description,
      q.id AS question_id,
      q.text AS question,
      o.id AS option_id,
      o.text AS option_text
    FROM exams e
    JOIN questions q ON q.exam_id = e.id
    JOIN options o ON o.question_id = q.id
    WHERE e.id = ?
    ORDER BY q.id, o.id
  `;

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ msg: "Error al obtener examen" });

    if (results.length === 0) {
      return res.status(404).json({ msg: "Examen no encontrado" });
    }

    const exam = {
      id,
      title: results[0].title,
      description: results[0].description,
      questions: []
    };

    const map = {};

    results.forEach(row => {
      if (!map[row.question_id]) {
        map[row.question_id] = {
          id: row.question_id,
          text: row.question,
          options: []
        };
        exam.questions.push(map[row.question_id]);
      }

      map[row.question_id].options.push({
        id: row.option_id,
        text: row.option_text
      });
    });

    res.json(exam);
  });
};

// CALIFICAR EXAMEN
exports.submitExam = (req, res) => {
  const { answers } = req.body;

  if (!answers || typeof answers !== "object") {
    return res.status(400).json({ msg: "Respuestas inválidas" });
  }

  const ids = Object.values(answers).map(Number).filter(Boolean);

  if (ids.length === 0) {
    return res.json({ score: 0, correct: 0, total: 0 });
  }

  db.query(
    `SELECT id FROM options WHERE id IN (?) AND is_correct = true`,
    [ids],
    (err, results) => {
      if (err) return res.status(500).json({ msg: "Error al calificar" });

      const correct = results.length;
      const total = ids.length;
      const score = Math.round((correct / total) * 100);

      res.json({ score, correct, total });
    }
  );
};
