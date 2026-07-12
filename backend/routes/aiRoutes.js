const express = require('express');
const router = express.Router();
const {
  getRecommendation,
  getRecommendationHistory,
  getFoodDescription,
} = require('../controllers/aiController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/recommend', protect, getRecommendation);
router.get('/recommend/history', protect, getRecommendationHistory);
router.post('/describe', protect, admin, getFoodDescription);

module.exports = router;
