const Product = require('../models/Product');
const { createProductSchema, updateProductSchema } = require('../validators/productValidator');

// @desc    Get all active products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true });
    res.status(200).json({ status: 'success', count: products.length, data: { products } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product || !product.isActive) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }
    
    res.status(200).json({ status: 'success', data: { product } });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Admin
const createProduct = async (req, res, next) => {
  try {
    const validatedData = createProductSchema.parse(req.body);
    
    // Check if slug exists
    const slugExists = await Product.findOne({ slug: validatedData.slug });
    if (slugExists) {
      return res.status(400).json({ status: 'error', message: 'Product slug already exists' });
    }

    const product = await Product.create(validatedData);
    
    res.status(201).json({ status: 'success', data: { product } });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ status: 'error', message: error.errors[0].message, errors: error.errors });
    }
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = async (req, res, next) => {
  try {
    const validatedData = updateProductSchema.parse(req.body);
    
    const product = await Product.findByIdAndUpdate(req.params.id, validatedData, {
      new: true,
      runValidators: true
    });
    
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }
    
    res.status(200).json({ status: 'success', data: { product } });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ status: 'error', message: error.errors[0].message, errors: error.errors });
    }
    next(error);
  }
};

// @desc    Deactivate a product (soft delete)
// @route   DELETE /api/products/:id
// @access  Admin
const deactivateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      { isActive: false },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }
    
    res.status(200).json({ status: 'success', message: 'Product deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deactivateProduct
};
