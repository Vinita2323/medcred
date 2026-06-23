import KYC from '../models/KYC.model.js';
import User from '../models/User.model.js';

// ── Submit KYC ──────────────────────────────────────────────────
export const submitKYC = async (req, res) => {
  try {
    const { aadhaarNumber, name, dob, address, pan } = req.body;
    const userId = req.user._id;

    // Check if KYC already exists
    let kyc = await KYC.findOne({ userId });
    
    if (kyc && ['pending', 'verified'].includes(kyc.status)) {
      return res.status(400).json({
        success: false,
        message: 'KYC is already submitted or verified.',
      });
    }

    // Handle multiple files
    const selfieUrl = req.files?.photo ? `/uploads/${req.files.photo[0].filename}` : undefined;
    const aadhaarFrontUrl = req.files?.aadhaarFront ? `/uploads/${req.files.aadhaarFront[0].filename}` : undefined;
    const aadhaarBackUrl = req.files?.aadhaarBack ? `/uploads/${req.files.aadhaarBack[0].filename}` : undefined;

    const kycData = {
      userId,
      userType: 'user',
      aadhaarNumber,
      pan,
      selfieUrl,
      aadhaarFrontUrl,
      aadhaarBackUrl,
      status: 'pending',
      submittedAt: new Date(),
    };

    if (kyc) {
      kyc = await KYC.findByIdAndUpdate(kyc._id, kycData, { new: true });
    } else {
      kyc = await KYC.create(kycData);
    }

    // Update User model
    await User.findByIdAndUpdate(userId, {
      kycStatus: 'pending',
      kycRef: kyc._id,
      aadhaarNumber,
      // We can also update name, dob, address if we want to sync them
      fullName: name || req.user.fullName,
      dob: dob || req.user.dob,
      address: address || req.user.address,
    });

    res.status(200).json({
      success: true,
      message: 'KYC submitted successfully',
      data: kyc,
    });
  } catch (error) {
    console.error('Submit KYC Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Get KYC Status (User) ───────────────────────────────────────
export const getKYCStatus = async (req, res) => {
  try {
    const kyc = await KYC.findOne({ userId: req.user._id });
    
    if (!kyc) {
      return res.status(200).json({
        success: true,
        data: { status: 'not_submitted' },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        status: kyc.status,
        submittedAt: kyc.submittedAt,
        rejectionReason: kyc.rejectionReason,
      },
    });
  } catch (error) {
    console.error('Get KYC Status Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Admin: Get All KYCs ─────────────────────────────────────────
export const adminGetAllKYC = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const kycs = await KYC.find(filter)
      .populate('userId', 'fullName mobile email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: kycs,
    });
  } catch (error) {
    console.error('Admin Get KYC Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Admin: Update KYC Status ────────────────────────────────────
export const adminUpdateKYC = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const kycId = req.params.id;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const kyc = await KYC.findById(kycId);
    if (!kyc) {
      return res.status(404).json({ success: false, message: 'KYC not found' });
    }

    kyc.status = status;
    kyc.reviewedBy = req.user._id;
    kyc.reviewedAt = new Date();
    
    if (status === 'rejected') {
      kyc.rejectionReason = rejectionReason;
    }

    await kyc.save();

    // Update User model
    const updateData = { kycStatus: status };
    if (status === 'verified') {
      updateData.aadhaarVerifiedAt = new Date();
    }
    await User.findByIdAndUpdate(kyc.userId, updateData);

    res.status(200).json({
      success: true,
      message: `KYC ${status} successfully`,
      data: kyc,
    });
  } catch (error) {
    console.error('Admin Update KYC Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
