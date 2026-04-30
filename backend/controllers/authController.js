const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔹 REGISTRO
exports.register = async (req, res) => {
  const { email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, hashed],
    (err, result) => {
      if (err) {
        return res.status(500).json({ msg: "Error al registrar" });
      }

      res.json({ msg: "Usuario creado" });
    }
  );
};

// 🔹 LOGIN
exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ msg: "Error servidor" });

      if (results.length === 0) {
        return res.status(404).json({ msg: "Usuario no existe" });
      }

      const user = results[0];

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return res.status(401).json({ msg: "Contraseña incorrecta" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email
        }
      });
    }
  );
};