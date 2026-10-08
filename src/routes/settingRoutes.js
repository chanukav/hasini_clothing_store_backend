const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Public route to get settings
router.get('/', settingController.getSettings);

// Admin-only route to update settings
router.put('/:key', protect, restrictTo('admin', 'superadmin'), settingController.updateSetting);

module.exports = router;
