import Loan from '../models/Loan.model.js';
import Card from '../models/Card.model.js';
import User from '../models/User.model.js';

const getDaysDiff = (date1, date2) => {
  const diffTime = Math.abs(date2 - date1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// @desc    Check loan eligibility
// @route   GET /api/v1/loans/eligibility
// @access  Private (User)
export const checkEligibility = async (req, res) => {
  try {
    const card = await Card.findOne({ userId: req.user._id, status: 'active' }).populate('planId');

    if (!card) {
      return res.status(200).json({
        success: true,
        data: {
          isEligible: false,
          hasCard: false,
        },
      });
    }

    const today = new Date();
    // Dynamically calculate eligible date based on LIVE plan settings
    const requiredWaitDays = card.planId?.loanEligibilityAfterDays || 30;
    const loanEligibleFrom = new Date(card.purchasedAt);
    loanEligibleFrom.setDate(loanEligibleFrom.getDate() + requiredWaitDays);
    
    let isEligible = today >= loanEligibleFrom;
    let daysActive = getDaysDiff(new Date(card.purchasedAt), today);
    let daysRemaining = isEligible ? 0 : getDaysDiff(today, loanEligibleFrom);
    let progressPct = Math.min(100, Math.round((daysActive / requiredWaitDays) * 100));

    // Optional: Check if already applied and not closed
    const activeLoan = await Loan.findOne({ userId: req.user._id, isActive: true });

    return res.status(200).json({
      success: true,
      data: {
        hasCard: true,
        isEligible,
        daysActive,
        daysRemaining,
        progressPct,
        cardType: card.cardType,
        maxLoanAmount: card.cardType === 'individual' ? 100000 : 200000,
        activeLoan: activeLoan ? {
          loanId: activeLoan.loanId,
          applicationStatus: activeLoan.applicationStatus,
          loanAmount: activeLoan.loanAmount,
        } : null,
      },
    });
  } catch (error) {
    console.error('Error in checkEligibility:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Apply for a loan
// @route   POST /api/v1/loans/apply
// @access  Private (User)
export const applyLoan = async (req, res) => {
  try {
    const {
      aadhaarNumber,
      panNumber,
      loanAmount,
      tenure,
      patients: patientsStr,
    } = req.body;

    const card = await Card.findOne({ userId: req.user._id, status: 'active' });
    if (!card) {
      return res.status(400).json({ success: false, message: 'Active membership required.' });
    }

    const today = new Date();
    if (today < new Date(card.loanEligibleFrom)) {
      return res.status(400).json({ success: false, message: 'You are not yet eligible for a loan.' });
    }

    const existingActiveLoan = await Loan.findOne({ userId: req.user._id, isActive: true });
    if (existingActiveLoan) {
      return res.status(400).json({ success: false, message: 'You already have an active loan application.' });
    }

    let patientsData = [];
    if (patientsStr) {
      try {
        patientsData = JSON.parse(patientsStr);
      } catch (err) {
        return res.status(400).json({ success: false, message: 'Invalid patients data format.' });
      }
    }

    // Attach uploaded files to patients
    if (req.files) {
      patientsData.forEach((patient, index) => {
        const presKey = `prescriptionFile_${index}`;
        const billKey = `billFile_${index}`;
        
        const presFile = req.files.find(f => f.fieldname === presKey);
        const billFile = req.files.find(f => f.fieldname === billKey);

        if (presFile) {
          patient.prescriptionFileUrl = `/uploads/${presFile.filename}`;
        }
        if (billFile) {
          patient.estimatedBillUrl = `/uploads/${billFile.filename}`;
        }
      });
    }

    const amount = Number(loanAmount);
    const months = Number(tenure);
    const emi = Math.round(amount / months);

    const newLoan = await Loan.create({
      userId: req.user._id,
      userName: req.user.fullName || req.user.name,
      cardId: card._id,
      aadhaarNumber,
      panNumber,
      loanAmount: amount,
      tenure: months,
      emiAmount: emi,
      interestRate: 0,
      totalRepayable: amount,
      loanType: card.cardType,
      patients: patientsData,
      cardPurchaseDate: card.purchasedAt,
      loanEligibleFrom: card.loanEligibleFrom,
      eligibilityStatus: 'eligible',
      applicationStatus: 'applied',
      isActive: true,
    });

    res.status(201).json({
      success: true,
      data: newLoan,
      message: 'Loan application submitted successfully.',
    });
  } catch (error) {
    console.error('Error in applyLoan:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get my active loan
// @route   GET /api/v1/loans/my-loan
// @access  Private (User)
export const getMyLoan = async (req, res) => {
  try {
    const loan = await Loan.findOne({ userId: req.user._id, isActive: true });
    
    if (!loan) {
      return res.status(404).json({ success: false, message: 'No active loan found.' });
    }

    res.status(200).json({
      success: true,
      data: loan,
    });
  } catch (error) {
    console.error('Error in getMyLoan:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all loans (Admin)
// @route   GET /api/v1/admin/loans
// @access  Private (Admin)
export const adminGetLoans = async (req, res) => {
  try {
    const loans = await Loan.find({}).sort({ appliedAt: -1 }).populate('userId', 'fullName email mobile');
    
    res.status(200).json({
      success: true,
      data: loans,
    });
  } catch (error) {
    console.error('Error in adminGetLoans:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update loan status (Admin)
// @route   PATCH /api/v1/admin/loans/:id
// @access  Private (Admin)
export const adminUpdateLoan = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found.' });
    }

    loan.applicationStatus = status;
    loan.reviewedBy = req.user._id;
    loan.reviewedAt = new Date();

    if (status === 'rejected') {
      loan.rejectionReason = rejectionReason;
      loan.isActive = false; // So user can apply again
    } else if (status === 'closed') {
      loan.isActive = false;
    } else if (status === 'disbursed') {
      loan.disbursedAt = new Date();
      loan.disbursedTo = 'Hospital Billing Desk'; // or pass from req.body
    }

    await loan.save();

    res.status(200).json({
      success: true,
      data: loan,
      message: 'Loan status updated successfully.',
    });
  } catch (error) {
    console.error('Error in adminUpdateLoan:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
