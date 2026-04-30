const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "exam_db",
  port: 3307
});

db.connect(err => {
  if (err) console.error(err);
  else console.log("🟢 MySQL conectado");
});

module.exports = db;