const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/frontend", express.static(path.join(__dirname, "../../frontend")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check
app.get("/health", (req, res) =>
  res.json({ ok: true, message: "GeniDoc API running" }),
);

// Routes - Use Supabase auth controller
const authRoutes = require("./routes/auth-supabase.routes");
const adminRoutes = require("./routes/admin.routes");
const pediatreRoutes = require("./routes/pediatre.routes");
const tuteurRoutes = require("./routes/tuteur.routes");

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/pediatre", pediatreRoutes);
app.use("/api/tuteur", tuteurRoutes);

module.exports = app;
