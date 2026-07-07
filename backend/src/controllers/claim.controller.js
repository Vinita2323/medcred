import Claim from '../models/Claim.model.js';
import Card from '../models/Card.model.js';
import { upload } from '../middlewares/upload.middleware.js';

// ── Submit Claim (User) ─────────────────────────────────────────
export const submitClaim = async (req, res) => {
  try {
    const { hospitalName, claimAmount, claimType, description } = req.body;
    const userId = req.user._id;

    if (!hospitalName || !claimAmount) {
      return res.status(400).json({ success: false, message: 'Hospital name and claim amount are required.' });
    }

    // Find user's active card and populate plan details for limits
    const card = await Card.findOne({ userId, status: 'active' }).populate('planId');

    if (!card) {
      return res.status(400).json({ success: false, message: 'No active card found.' });
    }

    // Limit Enforcement Validation
    const amount = Number(claimAmount);
    const limit = claimType === 'home_treatment' 
                  ? card.planId.homeTreatmentClaimLimit 
                  : card.planId.hospitalClaimLimit;

    if (amount > limit) {
      return res.status(400).json({ 
        success: false, 
        message: `Claim amount exceeds your plan's maximum limit of ₹${limit.toLocaleString('en-IN')}.` 
      });
    }

    // Enforce 8 Mandatory Documents
    const requiredDocs = [
      'claimForm', 'neftAndPhotoId', 'hospitalBillsAndDischarge', 
      'medicalPractitionerCertificate', 'chemistBills', 'investigationReports', 
      'referralLetter', 'ambulanceBills'
    ];

    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ success: false, message: 'No documents uploaded.' });
    }

    const getFile = (fieldname) => req.files.find(f => f.fieldname === fieldname);

    for (const doc of requiredDocs) {
      if (!getFile(doc)) {
        return res.status(400).json({ success: false, message: `Missing required document: ${doc}` });
      }
    }

    // Build legacy documents array (optional, for backward compatibility)
    const legacyDocs = req.files.filter(f => f.fieldname === 'documents');
    const documents = legacyDocs.map((file) => ({
      filename: file.originalname,
      url: `/uploads/${file.filename}`,
    }));

    const claim = await Claim.create({
      userId,
      cardId: card?._id,
      hospitalName,
      claimAmount: Number(claimAmount),
      claimType: claimType || 'medical_services',
      description,
      documents,
      claimFormUrl: `/uploads/${getFile('claimForm').filename}`,
      neftAndPhotoIdUrl: `/uploads/${getFile('neftAndPhotoId').filename}`,
      hospitalBillsAndDischargeUrl: `/uploads/${getFile('hospitalBillsAndDischarge').filename}`,
      medicalPractitionerCertificateUrl: `/uploads/${getFile('medicalPractitionerCertificate').filename}`,
      chemistBillsUrl: `/uploads/${getFile('chemistBills').filename}`,
      investigationReportsUrl: `/uploads/${getFile('investigationReports').filename}`,
      referralLetterUrl: `/uploads/${getFile('referralLetter').filename}`,
      ambulanceBillsUrl: `/uploads/${getFile('ambulanceBills').filename}`,
      status: 'pending',
      submittedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully',
      data: claim,
    });
  } catch (error) {
    console.error('Submit Claim Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Get My Claims (User) ────────────────────────────────────────
export const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ userId: req.user._id }).sort({ submittedAt: -1 });
    res.status(200).json({ success: true, data: claims });
  } catch (error) {
    console.error('Get My Claims Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Admin: Get All Claims ───────────────────────────────────────
export const adminGetAllClaims = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const claims = await Claim.find(filter)
      .populate('userId', 'fullName mobile email userId')
      .populate('cardId', 'cardNumber')
      .sort({ submittedAt: -1 });

    res.status(200).json({ success: true, data: claims });
  } catch (error) {
    console.error('Admin Get Claims Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Admin: Update Claim Status ──────────────────────────────────
export const adminUpdateClaim = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const claimId = req.params.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Use approved or rejected.' });
    }

    const claim = await Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    claim.status = status;
    claim.reviewedBy = req.user._id;
    claim.reviewedAt = new Date();
    if (status === 'rejected' && rejectionReason) {
      claim.rejectionReason = rejectionReason;
    }

    await claim.save();

    res.status(200).json({
      success: true,
      message: `Claim ${status} successfully`,
      data: claim,
    });
  } catch (error) {
    console.error('Admin Update Claim Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
