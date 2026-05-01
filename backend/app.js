require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Auth routes (faltaban en app.js original)
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/exams", require("./routes/examRoutes"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Backend listo en puerto ${PORT}`));
