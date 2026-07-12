const express = require('express');
const router = express.Router();
const {
  getFoodItemsByRestaurant,
  getFoodItemById,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
} = require('../controllers/foodItemController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, admin, createFoodItem);

router.route('/:id')
  .get(getFoodItemById)
  .put(protect, admin, updateFoodItem)
  .delete(protect, admin, deleteFoodItem);

router.get('/restaurant/:restaurantId', getFoodItemsByRestaurant);

module.exports = router;
