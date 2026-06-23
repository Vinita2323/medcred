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
  rejectionReason: {
    type: String,
  },
  isDuplicate: {
    type: Boolean,
    default: false,
  },
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
