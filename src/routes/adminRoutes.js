const express = require('express');
const {
  getAllOrders,
  updateOrderStatus,
  getDashboardMetrics,
  getAllCustomers,
  updateCustomerStatus,
  getAllProducts,
  updateProductStatus
} = require('../controllers/adminController');
const { protect, restrictToAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(restrictToAdmin);

router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/dashboard', getDashboardMetrics);
router.get('/customers', getAllCustomers);
router.put('/customers/:id/status', updateCustomerStatus);
router.get('/products', getAllProducts);
router.put('/products/:id/status', updateProductStatus);

module.exports = router;
