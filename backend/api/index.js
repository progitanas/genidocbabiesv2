// Serverless handler for Vercel deployment
// This file handles all incoming requests to the API

require('dotenv').config();
const app = require('../src/app-supabase');

// Export the Express app as a serverless function
module.exports = app;
