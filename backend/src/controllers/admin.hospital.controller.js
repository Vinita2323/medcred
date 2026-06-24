import Hospital from '../models/Hospital.model.js';

// Helper — flatten hospital for frontend
const formatHospital = (h) => ({
  id: h._id,
  hospitalId: h.hospitalId,
  name: h.name,
  // Flatten nested location → single string for UI
  location: [h.location?.address, h.location?.city, h.location?.state]
    .filter(Boolean)
    .join(', ') || 'N/A',
  contact: h.contact?.phone || h.contact?.email || 'N/A',
  claimEnabled: h.isClaimEnabled,
  network: h.isNetworkHospital,
  // Capitalize for UI badge
  status: h.status.charAt(0).toUpperCase() + h.status.slice(1),
  isVerified: h.isVerified,
  addedAt: new Date(h.createdAt).toLocaleDateString('en-IN'),
});

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/v1/admin/hospitals?status=&search=
// @desc    Get all hospitals with optional filters
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────
export const adminGetHospitals = async (req, res) => {
  try {
    const { status, search } = req.query;

    const filter = {};
    if (status && status !== 'All') {
      filter.status = status.toLowerCase();
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
      ];
    }

    const hospitals = await Hospital.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals.map(formatHospital),
    });
  } catch (error) {
    console.error('Admin Get Hospitals Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/v1/admin/hospitals
// @desc    Add a new hospital
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────
export const adminAddHospital = async (req, res) => {
  try {
    const { name, location, contact, claimEnabled, network } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Hospital name is required' });
    }

    const hospital = new Hospital({
      name,
      // Frontend sends single string → store in address field
      location: { address: location || '' },
      contact:  { phone: contact || '' },
      isClaimEnabled: claimEnabled || false,
      isNetworkHospital: network || false,
      addedBy: req.user._id,
      status: 'pending',
    });

    await hospital.save();

    res.status(201).json({
      success: true,
      message: 'Hospital added successfully',
      data: formatHospital(hospital),
    });
  } catch (error) {
    console.error('Admin Add Hospital Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   PATCH /api/v1/admin/hospitals/:id
// @desc    Update hospital details (name, location, contact)
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────
export const adminUpdateHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, contact } = req.body;

    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    if (name) hospital.name = name;
    if (location) hospital.location = { ...hospital.location, address: location };
    if (contact) hospital.contact = { ...hospital.contact, phone: contact };

    await hospital.save();

    res.status(200).json({
      success: true,
      message: 'Hospital updated successfully',
      data: formatHospital(hospital),
    });
  } catch (error) {
    console.error('Admin Update Hospital Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   PATCH /api/v1/admin/hospitals/:id/status
// @desc    Approve (active) or Deactivate (inactive) a hospital
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────
export const adminUpdateHospitalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updateData = { status };

    // On approval, mark verified
    if (status === 'active') {
      updateData.isVerified = true;
      updateData.verifiedBy = req.user._id;
      updateData.verifiedAt = new Date();
    }

    const hospital = await Hospital.findByIdAndUpdate(id, updateData, { new: true });

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    res.status(200).json({
      success: true,
      message: `Hospital ${status} successfully`,
      data: formatHospital(hospital),
    });
  } catch (error) {
    console.error('Admin Update Hospital Status Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   PATCH /api/v1/admin/hospitals/:id/toggle
// @desc    Toggle isClaimEnabled or isNetworkHospital flag
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────
export const adminToggleHospitalFlag = async (req, res) => {
  try {
    const { id } = req.params;
    const { field } = req.body;

    if (!['isClaimEnabled', 'isNetworkHospital'].includes(field)) {
      return res.status(400).json({ success: false, message: 'Invalid field to toggle' });
    }

    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    hospital[field] = !hospital[field];
    await hospital.save();

    res.status(200).json({
      success: true,
      message: `${field} toggled to ${hospital[field]}`,
      data: formatHospital(hospital),
    });
  } catch (error) {
    console.error('Admin Toggle Hospital Flag Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
