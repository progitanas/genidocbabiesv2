const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth-supabase.controller");
const { verifyToken } = require("../middleware/auth-jwt");

// Public routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);

// Protected routes
router.get("/profile", verifyToken, authController.getProfile);

module.exports = router;
