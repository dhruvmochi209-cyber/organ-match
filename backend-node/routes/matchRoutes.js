const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateMatches, getAllMatches, getMatchDetail, getMyMatches } = require('../controllers/matchController');

router.post('/generate', protect, generateMatches);
router.get('/all', protect, getAllMatches);
router.get('/my-matches', protect, getMyMatches);
router.get('/:match_id', protect, getMatchDetail); // dynamic routes at bottom

module.exports = router;
