// Serverless handler for Vercel deployment
require("dotenv").config();

const app = require("../src/app-supabase");

// Vercel serverless function - pass through to Express app
module.exports = (req, res) => {
  // Set CORS headers explicitly for Vercel
  const allowedOrigins = [
    "https://www.genidochayat.ma",
    "https://genidochayat.ma",
    "http://localhost:3000",
    "http://localhost:5000",
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    return res.status(200).end();
  }
  
  // Pass to Express app
  return app(req, res);
};
