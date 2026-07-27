const express = require('express');
const router = express.Router();
const { login, getCurrentUser, refresh } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', authenticate, getCurrentUser);
router.post('/refresh', refresh);

module.exports = router;