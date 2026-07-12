const FoodItem = require('../models/FoodItem');
const Restaurant = require('../models/Restaurant');

// @desc    Get all food items for a restaurant
// @route   GET /api/fooditems/restaurant/:restaurantId
// @access  Public
const getFoodItemsByRestaurant = async (req, res) => {
  try {
    const foodItems = await FoodItem.find({ restaurantId: req.params.restaurantId });
    return res.json({ success: true, count: foodItems.length, data: foodItems });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single food item
// @route   GET /api/fooditems/:id
// @access  Public
const getFoodItemById = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);
    if (!foodItem) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }
    return res.json({ success: true, data: foodItem });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a food item
// @route   POST /api/fooditems
// @access  Private/Admin
const createFoodItem = async (req, res) => {
  try {
    const { restaurantId, name, image, description, price, type, category, rating } = req.body;

    if (!restaurantId || !name || !image || !description || !price || !category) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Verify restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const foodItem = await FoodItem.create({
      restaurantId,
      name,
      image,
      description,
      price,
      type: type || 'veg',
      category,
      rating: rating || 0,
    });

    return res.status(201).json({ success: true, data: foodItem });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a food item
// @route   PUT /api/fooditems/:id
// @access  Private/Admin
const updateFoodItem = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    const updatedFoodItem = await FoodItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    return res.json({ success: true, data: updatedFoodItem });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a food item
// @route   DELETE /api/fooditems/:id
// @access  Private/Admin
const deleteFoodItem = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    await foodItem.deleteOne();

    return res.json({ success: true, message: 'Food item deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getFoodItemsByRestaurant,
  getFoodItemById,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
};
