require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");
const holidayRoutes = require("./routes/holidayRoutes");

const app = express();

// ---------- middleware ----------
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
  })
);
app.use(express.json({ limit: "5mb" })); // higher limit since notes can include base64 photos

// ---------- routes ----------
app.get("/", (req, res) => {
  res.json({ message: "DayCanvas API is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/holidays", holidayRoutes);
// ---------- 404 fallback ----------
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// ---------- start server ----------
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`DayCanvas API listening on http://localhost:${PORT}`);
  });
});
