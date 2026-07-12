const { recommendFood, generateFoodDescription } = require('../services/aiService');
const RecommendationHistory = require('../models/RecommendationHistory');

// @desc    Get AI Food Recommendation based on mood, budget, type, etc.
// @route   POST /api/ai/recommend
// @access  Private
const getRecommendation = async (req, res) => {
  try {
    const { mood, budget, foodType, preference, cuisine } = req.body;

    if (!mood || !budget || !foodType || !preference || !cuisine) {
      return res.status(400).json({ success: false, message: 'Please provide all recommendation criteria' });
    }

    // Call AI Service
    const recommendation = await recommendFood(mood, budget, foodType, preference, cuisine);

    // Save to user history
    const historyItem = await RecommendationHistory.create({
      userId: req.user._id,
      mood,
      budget: parseFloat(budget),
      foodType,
      preference,
      cuisine,
      recommendation,
    });

    return res.json({
      success: true,
      recommendation,
      historyItem,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get AI Recommendation History for logged-in user
// @route   GET /api/ai/recommend/history
// @access  Private
const getRecommendationHistory = async (req, res) => {
  try {
    const history = await RecommendationHistory.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, count: history.length, data: history });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate Food Description for Admin
// @route   POST /api/ai/describe
// @access  Private/Admin
const getFoodDescription = async (req, res) => {
  try {
    const { foodName } = req.body;

    if (!foodName) {
      return res.status(400).json({ success: false, message: 'Please provide food name' });
    }

    const description = await generateFoodDescription(foodName);

    return res.json({ success: true, description });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getRecommendation,
  getRecommendationHistory,
  getFoodDescription,
};
