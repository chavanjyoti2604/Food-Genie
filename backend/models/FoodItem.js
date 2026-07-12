const mongoose = require('mongoose');

const FoodItemSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please add a food item name'],
    trim: true,
  },
  image: {
    type: String,
    required: [true, 'Please add an image URL'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
  },
  type: {
    type: String,
    enum: ['veg', 'non-veg'],
    default: 'veg',
  },
  category: {
    type: String,
    required: [true, 'Please add a food category (e.g. Starter, Main Course, Dessert, Beverages)'],
  },
  rating: {
    type: Number,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('FoodItem', FoodItemSchema);
