const express = require('express');
const router = express.Router();
const { protectOptional } = require('../middleware/authMiddleware');
const { queryChatbot } = require('../controllers/chatbotController');

router.post('/query', protectOptional, queryChatbot);

module.exports = router;
