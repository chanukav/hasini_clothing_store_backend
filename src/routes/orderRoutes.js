const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  payhereNotify
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Webhook for PayHere (does not require auth)
router.post('/payhere/notify', payhereNotify);

router.use(protect); // All order routes below require authentication

router.route('/')
  .post(createOrder);

router.route('/my-orders')
  .get(getMyOrders);

router.route('/:id')
  .get(getOrderById);

module.exports = router;
