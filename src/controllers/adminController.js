const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Admin
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).populate('customer', 'name email');
    res.status(200).json({ status: 'success', count: orders.length, data: { orders } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    
    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after', runValidators: true }
    );
    
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }
    
    res.status(200).json({ status: 'success', data: { order } });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an order
// @route   DELETE /api/admin/orders/:id
// @access  Admin
const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }
    res.status(200).json({ status: 'success', message: 'Order deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard metrics
// @route   GET /api/admin/dashboard
// @access  Admin
const getDashboardMetrics = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
    
    // Revenue calculation
    const revenueStats = await Order.aggregate([
      { $match: { paymentStatus: 'PAID' } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;
    
    res.status(200).json({
      status: 'success',
      data: {
        totalOrders,
        totalRevenue,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all customers
// @route   GET /api/admin/customers
// @access  Admin
const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await User.find({ role: 'CUSTOMER' }).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', count: customers.length, data: { customers } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all admins
// @route   GET /api/admin/admins
// @access  Admin
const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN'] } }).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', count: admins.length, data: { admins } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update admin role
// @route   PUT /api/admin/admins/:id/role
// @access  Admin (Preferably SUPER_ADMIN but keeping open as requested)
const updateAdminRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    
    if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
      return res.status(400).json({ status: 'error', message: 'Invalid role' });
    }

    const admin = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { returnDocument: 'after', runValidators: true }
    );
    
    if (!admin) {
      return res.status(404).json({ status: 'error', message: 'Admin not found' });
    }
    
    res.status(200).json({ status: 'success', data: { admin } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer status
// @route   PUT /api/admin/customers/:id/status
// @access  Admin
const updateCustomerStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    
    const customer = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { returnDocument: 'after', runValidators: true }
    );
    
    if (!customer) {
      return res.status(404).json({ status: 'error', message: 'Customer not found' });
    }
    
    res.status(200).json({ status: 'success', data: { customer } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products (admin bypasses active filter)
// @route   GET /api/admin/products
// @access  Admin
const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', count: products.length, data: { products } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product status
// @route   PUT /api/admin/products/:id/status
// @access  Admin
const updateProductStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { returnDocument: 'after', runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }
    
    res.status(200).json({ status: 'success', data: { product } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getDashboardMetrics,
  getAllCustomers,
  updateCustomerStatus,
  getAllAdmins,
  updateAdminRole,
  getAllProducts,
  updateProductStatus
};
