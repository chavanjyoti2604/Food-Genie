const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const { summarizeReviews } = require('../services/aiService');

// @desc    Submit a review for a restaurant
// @route   POST /api/reviews
// @access  Private
const submitReview = async (req, res) => {
  try {
    const { restaurantId, rating, review } = req.body;

    if (!restaurantId || !rating || !review) {
      return res.status(400).json({ success: false, message: 'Please provide restaurant ID, rating and review text' });
    }

    // Verify restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Create review
    const newReview = await Review.create({
      userId: req.user._id,
      restaurantId,
      rating: parseInt(rating),
      review,
    });

    // 1. Recalculate average rating for the restaurant
    const reviews = await Review.find({ restaurantId });
    const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = parseFloat((totalRating / reviews.length).toFixed(1));

    restaurant.rating = averageRating;

    // 2. Async/await generate AI Review Summary based on all current reviews
    try {
      const summary = await summarizeReviews(reviews);
      restaurant.reviewSummary = summary;
    } catch (aiErr) {
      console.error('Error generating AI review summary:', aiErr.message);
      // Fail silently for AI summary, don't crash review submission
    }

    await restaurant.save();

    // Populate user info for frontend response
    await newReview.populate('userId', 'name');

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: newReview,
      restaurantRating: restaurant.rating,
      restaurantReviewSummary: restaurant.reviewSummary,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reviews for a restaurant
// @route   GET /api/reviews/restaurant/:restaurantId
// @access  Public
const getRestaurantReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ restaurantId: req.params.restaurantId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  submitReview,
  getRestaurantReviews,
};
