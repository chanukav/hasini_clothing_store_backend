const express = require('express');
const {
  getAllOrders,
  updateOrderStatus,
  getDashboardMetrics
} = require('../controllers/adminController');
const { protect, restrictToAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(restrictToAdmin);

router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/dashboard', getDashboardMetrics);

module.exports = router;
