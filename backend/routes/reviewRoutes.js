const express = require('express');
const router = express.Router();
const { submitReview, getRestaurantReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, submitReview);
router.get('/restaurant/:restaurantId', getRestaurantReviews);

module.exports = router;
