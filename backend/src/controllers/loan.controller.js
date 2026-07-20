import Loan from '../models/Loan.model.js';
import Card from '../models/Card.model.js';
import User from '../models/User.model.js';
import Notification from '../models/Notification.model.js';
import { sendPushNotification } from '../services/notification.service.js';

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

    const user = await User.findById(req.user._id);
    const hasBypass = user?.bypassLoanWaitingPeriod || false;

    const today = new Date();
    // Dynamically calculate eligible date based on LIVE plan settings
    const requiredWaitDays = card.planId?.loanEligibilityAfterDays !== undefined ? card.planId.loanEligibilityAfterDays : 30;
    const loanEligibleFrom = new Date(card.purchasedAt);
    loanEligibleFrom.setDate(loanEligibleFrom.getDate() + requiredWaitDays);
    
    let isEligible = hasBypass || (today >= loanEligibleFrom);
    let daysActive = getDaysDiff(new Date(card.purchasedAt), today);
    let daysRemaining = isEligible ? 0 : getDaysDiff(today, loanEligibleFrom);
    let progressPct = isEligible ? 100 : (requiredWaitDays === 0 ? 100 : Math.min(100, Math.round((daysActive / requiredWaitDays) * 100)));

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
        requiredWaitDays,
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

    const user = await User.findById(req.user._id);
    const hasBypass = user?.bypassLoanWaitingPeriod || false;

    const today = new Date();
    if (!hasBypass && today < new Date(card.loanEligibleFrom)) {
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
    try {
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

          // New Mandatory Medical Claim Documents
          const docs = [
            'claimForm', 'neftAndPhotoId', 'hospitalBillsAndDischarge',
            'medicalPractitionerCertificate', 'chemistBills', 'investigationReports',
            'referralLetter', 'ambulanceBills'
          ];

          docs.forEach(doc => {
            const file = req.files.find(f => f.fieldname === `${doc}_${index}`);
            if (file) {
              patient[`${doc}Url`] = `/uploads/${file.filename}`;
            } else {
              throw new Error(`Missing mandatory medical document: ${doc} for patient index ${index}`);
            }
          });
        });
      }
    } catch (docErr) {
      return res.status(400).json({ success: false, message: docErr.message });
    }

    const getFileUrl = (fieldname) => {
      const file = (req.files || []).find(f => f.fieldname === fieldname);
      return file ? `/uploads/${file.filename}` : null;
    };

    const amount = Number(loanAmount);
    const months = Number(tenure);
    // Calculate Flat 12% EMI
    const interest = amount * 0.12 * (months / 12);
    const totalRepayment = amount + interest;
    const emi = Math.round(totalRepayment / months);

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
      isEmergency: hasBypass,
      isActive: true,

      // Applicant details
      applicant_bankAccountNumber: req.body.bankAccountNumber,
      applicant_ifscCode: req.body.ifscCode,
      applicant_cibilScore: req.body.cibilScore ? Number(req.body.cibilScore) : null,
      applicant_aadhaarCardUrl: getFileUrl('applicant_aadhaarCardFile'),
      applicant_photoUrl: getFileUrl('applicant_photoFile'),
      applicant_panCardUrl: getFileUrl('applicant_panCardFile'),
      applicant_bankStatementUrl: getFileUrl('applicant_bankStatementFile'),
      applicant_addressProofUrl: getFileUrl('applicant_addressProofFile'),
      applicant_chequeUrl: getFileUrl('applicant_chequeFile'),
      applicant_cibilScoreUrl: getFileUrl('applicant_cibilScoreFile'),

      // Guarantor 1 details
      guarantor1_name: req.body.guarantor1_name,
      guarantor1_mobile: req.body.guarantor1_mobile,
      guarantor1_email: req.body.guarantor1_email,
      guarantor1_dob: req.body.guarantor1_dob ? new Date(req.body.guarantor1_dob) : null,
      guarantor1_gender: req.body.guarantor1_gender,
      guarantor1_relationship: req.body.guarantor1_relationship,
      guarantor1_occupation: req.body.guarantor1_occupation,
      guarantor1_companyName: req.body.guarantor1_companyName,
      guarantor1_monthlyIncome: req.body.guarantor1_monthlyIncome ? Number(req.body.guarantor1_monthlyIncome) : null,
      guarantor1_address: req.body.guarantor1_address,
      guarantor1_city: req.body.guarantor1_city,
      guarantor1_state: req.body.guarantor1_state,
      guarantor1_pincode: req.body.guarantor1_pincode,
      guarantor1_aadhaarNumber: req.body.guarantor1_aadhaarNumber,
      guarantor1_panNumber: req.body.guarantor1_panNumber,
      guarantor1_bankAccountNumber: req.body.guarantor1_bankAccountNumber,
      guarantor1_ifscCode: req.body.guarantor1_ifscCode,
      guarantor1_cibilScore: req.body.guarantor1_cibilScore ? Number(req.body.guarantor1_cibilScore) : null,
      guarantor1_aadhaarCardUrl: getFileUrl('guarantor1_aadhaarCardFile'),
      guarantor1_photoUrl: getFileUrl('guarantor1_photoFile'),
      guarantor1_panCardUrl: getFileUrl('guarantor1_panCardFile'),
      guarantor1_bankStatementUrl: getFileUrl('guarantor1_bankStatementFile'),
      guarantor1_addressProofUrl: getFileUrl('guarantor1_addressProofFile'),
      guarantor1_chequeUrl: getFileUrl('guarantor1_chequeFile'),
      guarantor1_cibilScoreUrl: getFileUrl('guarantor1_cibilScoreFile'),

      // Guarantor 2 details
      guarantor2_name: req.body.guarantor2_name,
      guarantor2_mobile: req.body.guarantor2_mobile,
      guarantor2_email: req.body.guarantor2_email,
      guarantor2_dob: req.body.guarantor2_dob ? new Date(req.body.guarantor2_dob) : null,
      guarantor2_gender: req.body.guarantor2_gender,
      guarantor2_relationship: req.body.guarantor2_relationship,
      guarantor2_occupation: req.body.guarantor2_occupation,
      guarantor2_companyName: req.body.guarantor2_companyName,
      guarantor2_monthlyIncome: req.body.guarantor2_monthlyIncome ? Number(req.body.guarantor2_monthlyIncome) : null,
      guarantor2_address: req.body.guarantor2_address,
      guarantor2_city: req.body.guarantor2_city,
      guarantor2_state: req.body.guarantor2_state,
      guarantor2_pincode: req.body.guarantor2_pincode,
      guarantor2_aadhaarNumber: req.body.guarantor2_aadhaarNumber,
      guarantor2_panNumber: req.body.guarantor2_panNumber,
      guarantor2_bankAccountNumber: req.body.guarantor2_bankAccountNumber,
      guarantor2_ifscCode: req.body.guarantor2_ifscCode,
      guarantor2_cibilScore: req.body.guarantor2_cibilScore ? Number(req.body.guarantor2_cibilScore) : null,
      guarantor2_aadhaarCardUrl: getFileUrl('guarantor2_aadhaarCardFile'),
      guarantor2_photoUrl: getFileUrl('guarantor2_photoFile'),
      guarantor2_panCardUrl: getFileUrl('guarantor2_panCardFile'),
      guarantor2_bankStatementUrl: getFileUrl('guarantor2_bankStatementFile'),
      guarantor2_addressProofUrl: getFileUrl('guarantor2_addressProofFile'),
      guarantor2_chequeUrl: getFileUrl('guarantor2_chequeFile'),
      guarantor2_cibilScoreUrl: getFileUrl('guarantor2_cibilScoreFile'),
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

// @desc    Get all loans for current user (History)
// @route   GET /api/v1/loans/history
// @access  Private (User)
export const getLoanHistory = async (req, res) => {
  try {
    const loans = await Loan.find({ userId: req.user._id }).sort({ appliedAt: -1 });
    res.status(200).json({
      success: true,
      data: loans,
    });
  } catch (error) {
    console.error('Error in getLoanHistory:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get a specific loan by ID
// @route   GET /api/v1/loans/:id
// @access  Private (User)
export const getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found.' });
    }
    res.status(200).json({
      success: true,
      data: loan,
    });
  } catch (error) {
    console.error('Error in getLoanById:', error);
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
      loan.rejectedAt = new Date();
      loan.rejectedBy = req.user._id;
      loan.isActive = false; // So user can apply again

      // Create notification
      await Notification.create({
        userId: loan.userId,
        title: 'Loan Application Rejected',
        message: 'Your loan application has been rejected.',
        reason: rejectionReason,
        type: 'error',
        icon: 'cancel',
        link: `/loan-details/${loan._id}`
      });

      // Send push notification if user has fcmToken
      const applicant = await User.findById(loan.userId).select('fcmToken');
      if (applicant && applicant.fcmToken) {
        await sendPushNotification({
          token: applicant.fcmToken,
          title: 'Loan Application Rejected',
          body: `Your loan application has been rejected. Reason: ${rejectionReason}`,
          data: { route: `/loan-details/${loan._id}` }
        });
      }
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
