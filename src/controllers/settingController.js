const Setting = require('../models/Setting');

// Get all settings or a specific setting
exports.getSettings = async (req, res) => {
  try {
    const { key } = req.query;
    
    if (key) {
      const setting = await Setting.findOne({ key });
      if (!setting) {
        return res.status(404).json({ status: 'fail', message: 'Setting not found' });
      }
      return res.status(200).json({ status: 'success', data: { setting } });
    }
    
    const settings = await Setting.find();
    res.status(200).json({ status: 'success', data: { settings } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Update or create a setting (Admin only)
exports.updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;
    
    const setting = await Setting.findOneAndUpdate(
      { key },
      { value, description, key },
      { new: true, upsert: true, runValidators: true }
    );
    
    res.status(200).json({ status: 'success', data: { setting } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
