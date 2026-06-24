import Hospital from '../models/Hospital.model.js';

// @route   GET /api/v1/hospitals
// @desc    Get all active/verified hospitals for user app
// @access  Public or User
export const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ status: 'active' }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals
    });
  } catch (error) {
    console.error('Get All Hospitals Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};
