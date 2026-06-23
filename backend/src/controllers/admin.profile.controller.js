import Admin from '../models/Admin.model.js';

// @route   GET /api/v1/admin/profile
// @desc    Get current admin profile
// @access  Private (Admin only)
export const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    console.error('Get Admin Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// @route   PATCH /api/v1/admin/profile
// @desc    Update current admin profile
// @access  Private (Admin only)
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const admin = await Admin.findById(req.user._id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    if (name) admin.name = name;
    if (email) admin.email = email;

    await admin.save({ validateModifiedOnly: true });

    res.status(200).json({ 
      success: true, 
      message: 'Admin profile updated successfully', 
      data: admin 
    });
  } catch (error) {
    console.error('Update Admin Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};
