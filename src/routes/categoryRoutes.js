const express = require('express');
const { getAllCategories, createCategory, deleteCategory, updateCategoryStatus, updateCategory } = require('../controllers/categoryController');
const { protect, restrictToAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route to get all categories
router.get('/', getAllCategories);

// Protected Admin Routes
router.use(protect);
router.use(restrictToAdmin);

router.post('/', createCategory);
router.delete('/:id', deleteCategory);
router.put('/:id/status', updateCategoryStatus);
router.put('/:id', updateCategory);

module.exports = router;
