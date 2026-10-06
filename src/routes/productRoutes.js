const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deactivateProduct
} = require('../controllers/productController');
const { protect, restrictToAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, restrictToAdmin, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, restrictToAdmin, updateProduct)
  .delete(protect, restrictToAdmin, deactivateProduct);

module.exports = router;
