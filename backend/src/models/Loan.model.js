import mongoose from 'mongoose';

const PatientSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true,
  },
  relationship: {
    type: String,
    enum: ['Self', 'Spouse', 'Child', 'Parent', 'Sibling', 'Other'],
    required: true,
  },
  familyMemberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyMember',
  },
  hospitalName: {
    type: String,
    required: true,
  },
  admissionDate: {
    type: Date,
    required: true,
  },
  treatmentReason: {
    type: String,
  },
  prescriptionFileUrl: {
    type: String,
    required: true,
  },
  estimatedBillUrl: {
    type: String,
  },
});

const LoanSchema = new mongoose.Schema({
  loanId: {
    type: String,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
    required: true,
  },
  aadhaarNumber: {
    type: String,
    required: true,
  },
  panNumber: {
    type: String,
    required: true,
  },
  loanAmount: {
    type: Number,
    required: true,
  },
  tenure: {
    type: Number,
    required: true,
  },
  emiAmount: {
    type: Number,
    required: true,
  },
  interestRate: {
    type: Number,
    default: 0,
  },
  totalRepayable: {
    type: Number,
    required: true,
  },
  loanType: {
    type: String,
    enum: ['individual', 'family', 'premium'],
    required: true,
  },
  patients: [PatientSchema],
  cardPurchaseDate: {
    type: Date,
    required: true,
  },
  loanEligibleFrom: {
    type: Date,
    required: true,
  },
  eligibilityStatus: {
    type: String,
    enum: ['eligible', 'not_eligible', 'waiting'],
  },
  daysUntilEligible: {
    type: Number,
  },
  applicationStatus: {
    type: String,
    enum: ['not_applied', 'applied', 'under_review', 'approved', 'rejected', 'disbursed', 'closed'],
    default: 'applied',
  },
  disbursedAt: {
    type: Date,
  },
  disbursedTo: {
    type: String,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  reviewedAt: {
    type: Date,
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  rejectedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
  },
  isDuplicate: {
    type: Boolean,
    default: false,
  },
  isEmergency: {
    type: Boolean,
    default: false,
  },
  // ── Applicant Financial Details & Uploaded Files ───────────
  applicant_bankAccountNumber: String,
  applicant_ifscCode: String,
  applicant_cibilScore: Number,
  applicant_aadhaarCardUrl: String,
  applicant_photoUrl: String,
  applicant_panCardUrl: String,
  applicant_bankStatementUrl: String,
  applicant_addressProofUrl: String,
  applicant_chequeUrl: String,
  applicant_cibilScoreUrl: String,

  // ── Guarantor 1 Info & Uploaded Files ──────────────────────
  guarantor1_name: String,
  guarantor1_mobile: String,
  guarantor1_email: String,
  guarantor1_dob: Date,
  guarantor1_gender: String,
  guarantor1_relationship: String,
  guarantor1_occupation: String,
  guarantor1_companyName: String,
  guarantor1_monthlyIncome: Number,
  guarantor1_address: String,
  guarantor1_city: String,
  guarantor1_state: String,
  guarantor1_pincode: String,
  guarantor1_aadhaarNumber: String,
  guarantor1_panNumber: String,
  guarantor1_bankAccountNumber: String,
  guarantor1_ifscCode: String,
  guarantor1_cibilScore: Number,
  guarantor1_aadhaarCardUrl: String,
  guarantor1_photoUrl: String,
  guarantor1_panCardUrl: String,
  guarantor1_bankStatementUrl: String,
  guarantor1_addressProofUrl: String,
  guarantor1_chequeUrl: String,
  guarantor1_cibilScoreUrl: String,

  // ── Guarantor 2 Info & Uploaded Files ──────────────────────
  guarantor2_name: String,
  guarantor2_mobile: String,
  guarantor2_email: String,
  guarantor2_dob: Date,
  guarantor2_gender: String,
  guarantor2_relationship: String,
  guarantor2_occupation: String,
  guarantor2_companyName: String,
  guarantor2_monthlyIncome: Number,
  guarantor2_address: String,
  guarantor2_city: String,
  guarantor2_state: String,
  guarantor2_pincode: String,
  guarantor2_aadhaarNumber: String,
  guarantor2_panNumber: String,
  guarantor2_bankAccountNumber: String,
  guarantor2_ifscCode: String,
  guarantor2_cibilScore: Number,
  guarantor2_aadhaarCardUrl: String,
  guarantor2_photoUrl: String,
  guarantor2_panCardUrl: String,
  guarantor2_bankStatementUrl: String,
  guarantor2_addressProofUrl: String,
  guarantor2_chequeUrl: String,
  guarantor2_cibilScoreUrl: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  appliedByAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
  },
}, {
  timestamps: true,
});

// Pre-save to auto-generate loanId
LoanSchema.pre('save', function () {
  if (!this.loanId) {
    const timestamp = Date.now().toString().slice(-6);
    const randomStr = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.loanId = `LN${timestamp}${randomStr}`;
  }
});

const Loan = mongoose.model('Loan', LoanSchema);

export default Loan;
