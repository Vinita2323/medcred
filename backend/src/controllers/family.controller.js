import FamilyMember from '../models/FamilyMember.model.js';
import Card from '../models/Card.model.js';
import Plan from '../models/Plan.model.js';
import crypto from 'crypto';

// @desc    Add a family member
// @route   POST /api/v1/family/add
// @access  Private
export const addMember = async (req, res) => {
  try {
    const { name, relationship, dob, aadhaarNumber, consent } = req.body;
    
    // Check if user has an active card
    const card = await Card.findOne({ userId: req.user._id }).populate('planId');
    if (!card) {
      return res.status(404).json({ success: false, message: 'No active card found for this user. Purchase a plan first.' });
    }

    if (card.status !== 'active' && card.status !== 'pending_verification') {
        return res.status(403).json({ success: false, message: 'Card is not active.' });
    }

    // Enforce Plan Limits
    const plan = card.planId;
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan details not found.' });
    }

    // Only Family and Premium plans allow adding members
    if (plan.planId === 'individual' && relationship !== 'Self') {
      return res.status(403).json({ success: false, message: 'Individual plan does not allow adding dependents.' });
    }

    // Count existing members (excluding 'Self' if you want to count dependents only, but typically limit is total members including self, or dependents + self)
    // The FRD says "Up to 4 Members" for Family Plan. We'll count all existing members associated with this card.
    const existingCount = await FamilyMember.countDocuments({ cardId: card._id });
    if (existingCount >= plan.maxMembers && relationship !== 'Self') {
       return res.status(403).json({ success: false, message: `Maximum limit of ${plan.maxMembers} members reached for your ${plan.name}.` });
    }

    // Handle File Uploads
    let profilePhoto = null;
    let aadhaarFront = null;
    let aadhaarBack = null;
    
    if (req.files) {
      if (req.files['profilePhoto'] && req.files['profilePhoto'][0]) {
        profilePhoto = `/uploads/${req.files['profilePhoto'][0].filename}`;
      }
      if (req.files['aadhaarFront'] && req.files['aadhaarFront'][0]) {
        aadhaarFront = `/uploads/${req.files['aadhaarFront'][0].filename}`;
      }
      if (req.files['aadhaarBack'] && req.files['aadhaarBack'][0]) {
        aadhaarBack = `/uploads/${req.files['aadhaarBack'][0].filename}`;
      }
    }

    // Calculate Age
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Generate unique memberId
    const memberId = 'FM' + Date.now() + Math.floor(Math.random() * 1000);

    const newMember = await FamilyMember.create({
      memberId,
      primaryUserId: req.user._id,
      primaryUserName: req.user.fullName || req.user.name,
      cardId: card._id,
      name,
      relationship,
      dob,
      age,
      aadhaarNumber,
      aadhaarFront: aadhaarFront,
      aadhaarBack: aadhaarBack,
      profilePhoto: profilePhoto,
      consentGiven: consent === 'true' || consent === true,
      consentGivenAt: new Date(),
      isVerified: false,
      verificationStatus: 'pending',
      status: 'pending',
      isClaimEligible: false,
    });

    res.status(201).json({ success: true, data: newMember });

  } catch (error) {
    console.error('Error adding family member:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all family members for logged in user
// @route   GET /api/v1/family/members
// @access  Private
export const getMembers = async (req, res) => {
  try {
    const members = await FamilyMember.find({ primaryUserId: req.user.id });
    res.status(200).json({ success: true, count: members.length, data: members });
  } catch (error) {
    console.error('Error fetching family members:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Remove a family member
// @route   DELETE /api/v1/family/:id
// @access  Private
export const removeMember = async (req, res) => {
  try {
    const member = await FamilyMember.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Verify ownership
    if (member.primaryUserId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to remove this member' });
    }

    if (member.relationship === 'Self') {
      return res.status(400).json({ success: false, message: 'Cannot remove primary card holder.' });
    }

    await member.deleteOne();

    res.status(200).json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all family members (Admin)
// @route   GET /api/v1/admin/family
// @access  Private (Admin)
export const adminGetMembers = async (req, res) => {
  try {
    const members = await FamilyMember.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: members.length, data: members });
  } catch (error) {
    console.error('Error fetching members for admin:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Verify family member (Admin)
// @route   PATCH /api/v1/admin/family/:id/verify
// @access  Private (Admin)
export const adminVerifyMember = async (req, res) => {
  try {
    const { status } = req.body; // 'verified' or 'rejected'

    if (!['verified', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status. Must be verified or rejected.' });
    }

    const member = await FamilyMember.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    member.verificationStatus = status;
    member.isVerified = status === 'verified';
    member.status = status === 'verified' ? 'active' : 'suspended';
    member.isClaimEligible = status === 'verified';
    
    if (status === 'verified') {
        member.verifiedAt = new Date();
        member.verifiedBy = req.user.id;
    }

    await member.save();

    res.status(200).json({ success: true, data: member, message: `Member ${status} successfully` });
  } catch (error) {
    console.error('Error verifying member:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
