// Serverless handler for Vercel deployment
require("dotenv").config();

let app;

// Cache the app instance
function getApp() {
  if (!app) {
    app = require("../src/app-supabase");
  }
  return app;
}

// Vercel serverless function
module.exports = (req, res) => {
  const app = getApp();
  
  // Set CORS headers explicitly BEFORE passing to Express
  const allowedOrigins = [
    "https://www.genidochayat.ma",
    "https://genidochayat.ma",
    "http://localhost:3000",
    "http://localhost:5000",
  ];
  
  const origin = req.headers.origin;
  
  // ALWAYS set CORS headers, even for OPTIONS
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400");
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    // For debugging: log what origin we got
    console.log(`Origin not in whitelist: ${origin}`);
  }
  
  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  // Pass to Express app
  return app(req, res);
};
