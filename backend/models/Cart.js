const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [
    {
      foodItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodItem',
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
        min: [1, 'Quantity cannot be less than 1'],
      },
    },
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Cart', CartSchema);
