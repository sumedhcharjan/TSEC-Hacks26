
const express = require('express');
const router = express.Router();
const { getExample } = require('../controllers/example.controller');

// Stub middleware for auth verification (hackathon-safe)
const checkAuth = (req, res, next) => {
  
    const authHeader = req.headers.authorization;
    if (!authHeader) {
     
    }

    req.user = { sub: "mock-user-id", email: "mock@example.com" }; // Mock user
    next();
};

router.get('/example', checkAuth, getExample);

module.exports = router;
