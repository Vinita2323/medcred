import Loan from '../models/Loan.model.js';
import Card from '../models/Card.model.js';
import User from '../models/User.model.js';

// @desc    Apply for a loan on behalf of a customer
// @route   POST /api/v1/agent/loans/apply
// @access  Private (Agent)
export const agentApplyLoanForCustomer = async (req, res) => {
  try {
    const {
      customerId, // Can be cardId or Mobile
      patientName,
      relationship,
      admissionDate,
      hospitalName,
      loanAmount,
      tenure,
    } = req.body;

    if (!customerId || !patientName || !hospitalName || !admissionDate || !loanAmount) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Find the user and card
    let card = await Card.findOne({ cardId: customerId, status: 'active' }).populate('planId');
    let user;

    if (!card) {
      // Try finding by mobile
      user = await User.findOne({ mobile: customerId });
      if (!user) {
        return res.status(404).json({ success: false, message: 'Customer not found.' });
      }
      card = await Card.findOne({ userId: user._id, status: 'active' }).populate('planId');
    } else {
      user = await User.findById(card.userId);
    }

    if (!card) {
      return res.status(400).json({ success: false, message: 'Customer does not have an active membership card.' });
    }

    // Check Eligibility
    const requiredWaitDays = card.planId?.loanEligibilityAfterDays || 30;
    const loanEligibleFrom = new Date(card.purchasedAt);
    loanEligibleFrom.setDate(loanEligibleFrom.getDate() + requiredWaitDays);

    const today = new Date();
    if (today < loanEligibleFrom) {
      return res.status(400).json({ success: false, message: 'Customer is not yet eligible for a loan.' });
    }

    const existingActiveLoan = await Loan.findOne({ userId: user._id, isActive: true });
    if (existingActiveLoan) {
      return res.status(400).json({ success: false, message: 'Customer already has an active loan application.' });
    }

    // Handle File
    let prescriptionFileUrl = '';
    if (req.files && req.files.length > 0) {
      // Assuming 'prescriptionFile' is the fieldname
      const file = req.files.find(f => f.fieldname === 'prescriptionFile');
      if (file) {
        prescriptionFileUrl = `/uploads/${file.filename}`;
      }
    }

    if (!prescriptionFileUrl) {
      return res.status(400).json({ success: false, message: 'Prescription document is required.' });
    }

    const amount = Number(loanAmount);
    const months = Number(tenure || 12);
    
    // Calculate Flat 12% EMI
    const interest = amount * 0.12 * (months / 12);
    const totalRepay = amount + interest;
    const emi = Math.round(totalRepay / months);

    const patientsData = [{
      patientName,
      relationship,
      hospitalName,
      admissionDate: new Date(admissionDate),
      prescriptionFileUrl
    }];

    const newLoan = await Loan.create({
      userId: user._id,
      userName: user.fullName || user.name,
      cardId: card._id,
      aadhaarNumber: user.aadhaarNumber || 'PENDING',
      panNumber: user.panNumber || 'PENDING',
      loanAmount: amount,
      tenure: months,
      emiAmount: emi,
      interestRate: 12,
      totalRepayable: totalRepay,
      loanType: card.cardType,
      patients: patientsData,
      cardPurchaseDate: card.purchasedAt,
      loanEligibleFrom: loanEligibleFrom,
      eligibilityStatus: 'eligible',
      applicationStatus: 'applied',
      isActive: true,
      appliedByAgentId: req.user._id, // Track the Agent!
    });

    res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully on behalf of customer.',
      data: newLoan,
    });
  } catch (error) {
    console.error('Agent Apply Loan Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
