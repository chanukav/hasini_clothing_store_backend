const Product = require('../models/Product');
const { createProductSchema, updateProductSchema } = require('../validators/productValidator');

// @desc    Get all active products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, size, color, sort } = req.query;
    
    let query = { isActive: true };

    // Search by product name (Text Index)
    if (search) {
      query.$text = { $search: search };
    }

    // Category filtering
    if (category) {
      query.category = category.toLowerCase();
    }

    // Price filtering
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Size & Color filtering (queries the variants array)
    if (size || color) {
      const variantMatch = {};
      if (size) variantMatch.size = new RegExp(`^${size}$`, 'i');
      if (color) variantMatch.color = new RegExp(`^${color}$`, 'i');
      
      // If there are variant conditions, use $elemMatch so both apply to the SAME variant
      query.variants = { $elemMatch: variantMatch };
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // Default sorting (newest first)
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'name_asc') sortOption = { name: 1 };
    if (sort === 'name_desc') sortOption = { name: -1 };

    const products = await Product.find(query).sort(sortOption);
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
      const issues = error.errors || error.issues;
      return res.status(400).json({ status: 'error', message: issues?.[0]?.message || 'Validation error', errors: issues });
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
      returnDocument: 'after',
      runValidators: true
    });
    
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }
    
    res.status(200).json({ status: 'success', data: { product } });
  } catch (error) {
    if (error.name === 'ZodError') {
      const issues = error.errors || error.issues;
      return res.status(400).json({ status: 'error', message: issues?.[0]?.message || 'Validation error', errors: issues });
    }
    next(error);
  }
};

// @desc    Delete a product completely
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }
    
    res.status(200).json({ status: 'success', message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
