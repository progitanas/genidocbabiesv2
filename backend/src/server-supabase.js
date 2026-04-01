require("dotenv").config();
const app = require("./app-supabase");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║   🔐 GeniDoc API - Production Ready   ║
  ║   Backend: Supabase PostgreSQL        ║
  ║   Port: ${PORT}                          
  ║   Env: ${process.env.NODE_ENV}              
  ╚═══════════════════════════════════════╝
  `);
});

server.on("error", (error) => {
  console.error("❌ Server error:", error);
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("⚠️  SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});
