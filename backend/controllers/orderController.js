const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const FoodItem = require('../models/FoodItem');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, deliveryCharge, address, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    if (!address || !address.fullName || !address.mobile || !address.street || !address.city || !address.state || !address.pincode) {
      return res.status(400).json({ success: false, message: 'Please provide full delivery address details' });
    }

    const order = await Order.create({
      userId: req.user._id,
      items,
      totalAmount,
      deliveryCharge,
      address,
      paymentMethod: paymentMethod || 'COD',
      status: 'Pending',
    });

    // Clear user's cart
    const cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    return res.status(201).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('userId', 'name email mobile')
      .sort({ createdAt: -1 });
    return res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Preparing', 'Out For Delivery', 'Delivered'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    const updatedOrder = await order.save();

    return res.json({ success: true, data: updatedOrder });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard statistics & charts data
// @route   GET /api/orders/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    // 1. Total Counts
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalRestaurants = await Restaurant.countDocuments({});
    const totalFoodItems = await FoodItem.countDocuments({});
    const totalOrders = await Order.countDocuments({});
    
    // Total Revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: 'Delivered' } }, // Only count revenue from delivered orders
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Alternative: If no delivered orders, we can show total amount of all orders for testing convenience
    const allRevenueResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const overallRevenue = allRevenueResult.length > 0 ? allRevenueResult[0].total : 0;

    // 2. Charts: Monthly Orders and Revenue (last 6 months)
    const monthlyStats = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    // Format monthly data for charts
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthly = monthlyStats.map(stat => {
      const monthStr = monthNames[stat._id.month - 1] + ' ' + stat._id.year;
      return {
        month: monthStr,
        orders: stat.count,
        revenue: stat.revenue
      };
    });

    // 3. Top Restaurants (based on order count from items, or we can just aggregate)
    // For simplicity, we can do an aggregation of food items ordered.
    const ordersList = await Order.find({});
    const restaurantOrderCounts = {};

    for (const order of ordersList) {
      for (const item of order.items) {
        try {
          const food = await FoodItem.findById(item.foodItemId);
          if (food) {
            const rest = await Restaurant.findById(food.restaurantId);
            if (rest) {
              restaurantOrderCounts[rest.name] = (restaurantOrderCounts[rest.name] || 0) + item.quantity;
            }
          }
        } catch (e) {
          // ignore if food item deleted
        }
      }
    }

    const topRestaurants = Object.entries(restaurantOrderCounts)
      .map(([name, orders]) => ({ name, orders }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    // Fallbacks if aggregates are empty
    const finalMonthly = formattedMonthly.length > 0 ? formattedMonthly : [
      { month: 'Jun 2026', orders: totalOrders, revenue: overallRevenue }
    ];

    const finalTopRestaurants = topRestaurants.length > 0 ? topRestaurants : [
      { name: 'No Orders Yet', orders: 0 }
    ];

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalRestaurants,
        totalFoodItems,
        totalOrders,
        totalRevenue: totalRevenue || overallRevenue,
      },
      charts: {
        monthly: finalMonthly,
        topRestaurants: finalTopRestaurants,
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getAdminStats,
};
