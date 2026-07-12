const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getAdminStats,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect); // All order routes require authentication

router.route('/')
  .get(admin, getAllOrders)
  .post(createOrder);

router.get('/myorders', getMyOrders);
router.get('/admin/stats', admin, getAdminStats);
router.put('/:id/status', admin, updateOrderStatus);

module.exports = router;
