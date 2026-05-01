const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTRO
exports.register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Email y contraseña son requeridos" });
  }

  if (password.length < 6) {
    return res.status(400).json({ msg: "La contraseña debe tener al menos 6 caracteres" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hashed],
      (err) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ msg: "El correo ya está registrado" });
          }
          return res.status(500).json({ msg: "Error al registrar usuario" });
        }
        res.status(201).json({ msg: "Usuario creado exitosamente" });
      }
    );
  } catch (err) {
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};

// LOGIN
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Email y contraseña son requeridos" });
  }

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ msg: "Error del servidor" });

      if (results.length === 0) {
        return res.status(401).json({ msg: "Credenciales inválidas" });
      }

      const user = results[0];

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return res.status(401).json({ msg: "Credenciales inválidas" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES || "2h" }
      );

      res.json({
        token,
        user: { id: user.id, email: user.email }
      });
    }
  );
};
