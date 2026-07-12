const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a restaurant name'],
    trim: true,
  },
  image: {
    type: String,
    required: [true, 'Please add a restaurant image URL or path'],
  },
  address: {
    type: String,
    required: [true, 'Please add a restaurant address'],
  },
  cuisine: {
    type: String,
    required: [true, 'Please add cuisine type(s)'],
  },
  rating: {
    type: Number,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0,
  },
  deliveryCharge: {
    type: Number,
    required: [true, 'Please add a delivery charge'],
    default: 0,
  },
  deliveryTime: {
    type: Number,
    required: [true, 'Please add an average delivery time (minutes)'],
    default: 30,
  },
  reviewSummary: {
    type: String,
    default: 'No review summary available yet.',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
