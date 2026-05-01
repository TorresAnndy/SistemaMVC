const bcrypt = require("bcryptjs");
const db = require("../config/db.js");

const seedUsers = async () => {
  const users = [
    { email: "admin@test.com", password: "123456" },
    { email: "user@test.com", password: "123456" }
  ];

  for (let user of users) {
    const hashed = await bcrypt.hash(user.password, 10);

    db.query(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [user.email, hashed],
      (err) => {
        if (err) {
          console.log("Error:", err.message);
        } else {
          console.log(`✅ Usuario ${user.email} creado`);
        }
      }
    );
  }
};

seedUsers();