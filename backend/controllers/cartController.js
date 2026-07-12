const Cart = require('../models/Cart');
const FoodItem = require('../models/FoodItem');

// Helper to get or create a cart for a user
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    
    // Populate food item details
    await cart.populate({
      path: 'items.foodItemId',
      select: 'name price image type category rating restaurantId',
      populate: {
        path: 'restaurantId',
        select: 'name deliveryCharge deliveryTime'
      }
    });

    return res.json({ success: true, data: cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { foodItemId, quantity } = req.body;
    const qty = parseInt(quantity) || 1;

    if (!foodItemId) {
      return res.status(400).json({ success: false, message: 'Food item ID required' });
    }

    // Verify food item exists
    const foodItem = await FoodItem.findById(foodItemId);
    if (!foodItem) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    const cart = await getOrCreateCart(req.user._id);

    // Check if food item already in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.foodItemId.toString() === foodItemId
    );

    if (itemIndex > -1) {
      // Item exists, update quantity
      cart.items[itemIndex].quantity += qty;
    } else {
      // Add new item
      cart.items.push({ foodItemId, quantity: qty });
    }

    await cart.save();
    
    // Populate before sending back
    await cart.populate({
      path: 'items.foodItemId',
      select: 'name price image type category rating restaurantId'
    });

    return res.json({ success: true, message: 'Item added to cart', data: cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { foodItemId, quantity } = req.body;
    const qty = parseInt(quantity);

    if (!foodItemId || qty === undefined || isNaN(qty)) {
      return res.status(400).json({ success: false, message: 'Food item ID and valid quantity required' });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.foodItemId.toString() === foodItemId
    );

    if (itemIndex > -1) {
      if (qty <= 0) {
        // Remove item if quantity is 0 or less
        cart.items.splice(itemIndex, 1);
      } else {
        // Update quantity
        cart.items[itemIndex].quantity = qty;
      }
      await cart.save();
      
      await cart.populate({
        path: 'items.foodItemId',
        select: 'name price image type category rating restaurantId'
      });

      return res.json({ success: true, message: 'Cart updated', data: cart });
    } else {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:foodItemId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { foodItemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => item.foodItemId.toString() !== foodItemId
    );

    await cart.save();

    await cart.populate({
      path: 'items.foodItemId',
      select: 'name price image type category rating restaurantId'
    });

    return res.json({ success: true, message: 'Item removed from cart', data: cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return res.json({ success: true, message: 'Cart cleared successfully', data: cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
