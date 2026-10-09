const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  payhereNotify
} = require('../controllers/orderController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Webhook for PayHere (does not require auth)
router.post('/payhere/notify', payhereNotify);

// Order creation supports both logged-in users and guests
router.route('/')
  .post(optionalAuth, createOrder);

// Order history requires authentication
router.route('/my-orders')
  .get(protect, getMyOrders);

// Order details by ID (for confirmation page or account view)
router.route('/:id')
  .get(optionalAuth, getOrderById);

module.exports = router;
