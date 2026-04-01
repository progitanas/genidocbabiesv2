// Serverless handler for Vercel deployment
require("dotenv").config();

let app;

function getApp() {
  if (!app) {
    app = require("../src/app-supabase");
  }
  return app;
}

// CORS middleware wrapper
function withCORS(req, res) {
  const allowedOrigins = [
    "https://www.genidochayat.ma",
    "https://genidochayat.ma",
    "https://www.genidocbabiesv2.vercel.app",
    "https://genidocbabiesv2.vercel.app",
    "http://localhost:3000",
    "http://localhost:5000",
  ];
  
  const origin = req.headers.origin || req.headers.referer;
  
  // Always set CORS headers
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400");
  
  // Check if origin is in whitelist
  if (origin) {
    const cleanOrigin = origin.split('/').slice(0, 3).join('/'); // Extract protocol + domain
    if (allowedOrigins.some(allowed => cleanOrigin.includes(allowed.replace(/https?:\/\//, '')))) {
      res.setHeader("Access-Control-Allow-Origin", origin.split('/').slice(0, 3).join('/'));
    }
  }
  
  // Always allow www.genidochayat.ma
  res.setHeader("Access-Control-Allow-Origin", "https://www.genidochayat.ma");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
}

module.exports = (req, res) => {
  // Add CORS headers first
  withCORS(req, res);
  
  // Then pass to Express
  const app = getApp();
  return app(req, res);
};
