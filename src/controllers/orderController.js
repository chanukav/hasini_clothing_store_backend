const Order = require('../models/Order');
const Product = require('../models/Product');
const { createOrderSchema } = require('../validators/orderValidator');

// @desc    Create new order
// @route   POST /api/orders
// @access  User
const createOrder = async (req, res, next) => {
  try {
    // 1. Zod Validation of request structure
    const validatedData = createOrderSchema.parse(req.body);

    const { items, paymentMethod, customerDetails } = validatedData;
    
    let orderItems = [];
    let subtotal = 0;

    // 2. Process each item: fetch REAL price and check stock
    for (const item of items) {
      // Find Product
      const product = await Product.findById(item.productId);
      
      if (!product || !product.isActive) {
        return res.status(400).json({ status: 'error', message: `Product ${item.productId} not found or inactive` });
      }

      // Find Variant
      const variant = product.variants.find(v => v.sku === item.sku);
      if (!variant) {
        return res.status(400).json({ status: 'error', message: `Variant ${item.sku} not found for product ${product.name}` });
      }

      // Check Stock
      if (variant.stock < item.quantity) {
        return res.status(400).json({ status: 'error', message: `Not enough stock for ${product.name} (${variant.size}/${variant.color}). Available: ${variant.stock}` });
      }

      // Get REAL Price & Calculate subtotal
      const unitPrice = product.price; // or variant.priceOverride if you add that later
      const itemSubtotal = Math.round((unitPrice * item.quantity) * 100) / 100;

      orderItems.push({
        product: product._id,
        productName: product.name,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        quantity: item.quantity,
        unitPrice: unitPrice,
        subtotal: itemSubtotal
      });

      subtotal += itemSubtotal;
    }

    subtotal = Math.round(subtotal * 100) / 100;
    const total = subtotal; // If you add shipping/taxes, do it here.

    // 3. Generate Order Number
    const orderNumber = await Order.generateOrderNumber();

    // 4. Create Order
    const order = await Order.create({
      orderNumber,
      customer: req.user._id,
      customerDetails,
      items: orderItems,
      subtotal,
      total,
      paymentMethod,
      paymentStatus: 'PENDING',
      orderStatus: 'PENDING'
    });

    // 5. Reduce Stock immediately (since this is creation, though for PayHere you might want to wait until notify)
    // As per user instruction #6: "Reduce stock" at "Order created".
    for (const item of items) {
      await Product.updateOne(
        { _id: item.productId, "variants.sku": item.sku },
        { $inc: { "variants.$.stock": -item.quantity } }
      );
    }

    res.status(201).json({ status: 'success', data: { order } });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ status: 'error', message: error.errors[0].message, errors: error.errors });
    }
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  User
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', count: orders.length, data: { orders } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  User/Admin
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }

    // Ensure user is admin OR the owner of the order
    if (req.user.role !== 'ADMIN' && order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: 'error', message: 'You do not have permission to view this order' });
    }
    
    res.status(200).json({ status: 'success', data: { order } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById
};
