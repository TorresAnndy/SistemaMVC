const fs = require("fs");
const path = require("path");
const db = require("./config/db");

const runMigrations = async () => {
  const migrationsDir = path.join(__dirname, "migrations");

  db.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const files = fs.readdirSync(migrationsDir);

  for (const file of files) {
    const [rows] = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM migrations WHERE name = ?",
        [file],
        (err, result) => {
          if (err) reject(err);
          else resolve([result]);
        }
      );
    });

    if (rows.length === 0) {
      const sql = fs.readFileSync(
        path.join(migrationsDir, file),
        "utf-8"
      );

      await new Promise((resolve, reject) => {
        db.query(sql, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      db.query(
        "INSERT INTO migrations (name) VALUES (?)",
        [file]
      );

      console.log(`✅ Migración ejecutada: ${file}`);
    }
  }

  console.log("🚀 Base de datos actualizada");
};

runMigrations();