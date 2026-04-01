// Serverless handler for Vercel deployment
require("dotenv").config();

const express = require("express");

// Create a wrapper app with CORS
const corsApp = express();

// CORS middleware - run FIRST before anything else
corsApp.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://www.genidochayat.ma");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Max-Age", "86400");
  
  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  
  next();
});

// Mount the actual app
const app = require("../src/app-supabase");
corsApp.use(app);

// Export as default
module.exports = corsApp;
