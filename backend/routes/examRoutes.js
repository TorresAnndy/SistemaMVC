const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

router.get("/", auth, (req, res) => {
  res.json([
    { id: 1, titulo: "Examen protegido" }
  ]);
});

module.exports = router;