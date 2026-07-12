const mongoose = require('mongoose');

const RecommendationHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mood: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  foodType: {
    type: String,
    required: true,
  },
  preference: {
    type: String,
    required: true,
  },
  cuisine: {
    type: String,
    required: true,
  },
  recommendation: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('RecommendationHistory', RecommendationHistorySchema);
