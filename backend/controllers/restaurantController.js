const Restaurant = require('../models/Restaurant');
const FoodItem = require('../models/FoodItem');
const Review = require('../models/Review');

// @desc    Get all restaurants with search, filter, sort
// @route   GET /api/restaurants
// @access  Public
const getRestaurants = async (req, res) => {
  try {
    const { search, type, rating, priceRange, sort } = req.query;

    let query = {};

    // 1. Search by name or cuisine
    if (search) {
      // Also search if food items match search term
      const matchingFoodItems = await FoodItem.find({
        name: { $regex: search, $options: 'i' },
      }).select('restaurantId');
      
      const matchedRestaurantIds = matchingFoodItems.map(item => item.restaurantId);

      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { cuisine: { $regex: search, $options: 'i' } },
        { _id: { $in: matchedRestaurantIds } }
      ];
    }

    // 2. Filter by rating
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    // Fetch initial list of restaurants
    let restaurants = await Restaurant.find(query);

    // 3. Filter by Veg / Non-Veg (requires looking at food items)
    if (type) {
      const filteredRestaurants = [];
      for (const restaurant of restaurants) {
        const foodItems = await FoodItem.find({ restaurantId: restaurant._id });
        const hasMatchingType = foodItems.some(
          (item) => item.type.toLowerCase() === type.toLowerCase()
        );
        if (hasMatchingType) {
          filteredRestaurants.push(restaurant);
        }
      }
      restaurants = filteredRestaurants;
    }

    // 4. Filter by Price Range of food items (e.g. ₹100-₹200, ₹200-₹500, etc.)
    // Let's support price ranges: 'under-200', '200-500', 'over-500'
    if (priceRange) {
      const filteredRestaurants = [];
      for (const restaurant of restaurants) {
        const foodItems = await FoodItem.find({ restaurantId: restaurant._id });
        if (foodItems.length === 0) continue;
        
        const avgPrice = foodItems.reduce((acc, item) => acc + item.price, 0) / foodItems.length;
        
        let match = false;
        if (priceRange === 'under-200' && avgPrice <= 200) match = true;
        else if (priceRange === '200-500' && avgPrice > 200 && avgPrice <= 500) match = true;
        else if (priceRange === 'over-500' && avgPrice > 500) match = true;

        if (match) {
          filteredRestaurants.push(restaurant);
        }
      }
      restaurants = filteredRestaurants;
    }

    // Convert restaurants to plain objects and append their min/avg price for sorting/display
    let restaurantList = [];
    for (const rest of restaurants) {
      const foodItems = await FoodItem.find({ restaurantId: rest._id });
      const minPrice = foodItems.length > 0 ? Math.min(...foodItems.map(item => item.price)) : 0;
      const avgPrice = foodItems.length > 0 ? foodItems.reduce((acc, i) => acc + i.price, 0) / foodItems.length : 0;
      
      restaurantList.push({
        ...rest.toObject(),
        minPrice,
        avgPrice,
      });
    }

    // 5. Sorting
    if (sort) {
      if (sort === 'rating') {
        // High to Low
        restaurantList.sort((a, b) => b.rating - a.rating);
      } else if (sort === 'price') {
        // Low to High
        restaurantList.sort((a, b) => a.minPrice - b.minPrice);
      } else if (sort === 'deliveryTime') {
        // Low to High
        restaurantList.sort((a, b) => a.deliveryTime - b.deliveryTime);
      }
    }

    return res.json({ success: true, count: restaurantList.length, data: restaurantList });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single restaurant & its food items
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const foodItems = await FoodItem.find({ restaurantId: req.params.id });
    const reviews = await Review.find({ restaurantId: req.params.id }).populate('userId', 'name');

    return res.json({
      success: true,
      data: {
        restaurant,
        foodItems,
        reviews,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create restaurant
// @route   POST /api/restaurants
// @access  Private/Admin
const createRestaurant = async (req, res) => {
  try {
    const { name, image, address, cuisine, rating, deliveryCharge, deliveryTime } = req.body;

    if (!name || !image || !address || !cuisine) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const restaurant = await Restaurant.create({
      name,
      image,
      address,
      cuisine,
      rating: rating || 0,
      deliveryCharge: deliveryCharge || 0,
      deliveryTime: deliveryTime || 30,
    });

    return res.status(201).json({ success: true, data: restaurant });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private/Admin
const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    return res.json({ success: true, data: updatedRestaurant });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private/Admin
const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Also delete food items belonging to the restaurant
    await FoodItem.deleteMany({ restaurantId: req.params.id });
    // Delete reviews too
    await Review.deleteMany({ restaurantId: req.params.id });

    await restaurant.deleteOne();

    return res.json({ success: true, message: 'Restaurant and associated food items/reviews deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
};
