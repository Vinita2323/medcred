import mongoose from 'mongoose';

const familyMemberSchema = new mongoose.Schema(
  {
    memberId: {
      type: String,
      required: true,
      unique: true,
    },
    primaryUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    primaryUserName: {
      type: String,
      required: true,
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    relationship: {
      type: String,
      enum: ['Self', 'Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Parent', 'Child', 'Sibling', 'Other'],
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', null],
    },
    bloodGroup: {
      type: String,
    },
    profilePhoto: {
      type: String,
    },
    aadhaarNumber: {
      type: String,
    },
    aadhaarFront: {
      type: String,
    },
    aadhaarBack: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'suspended'],
      default: 'pending',
    },
    isClaimEligible: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes
familyMemberSchema.index({ primaryUserId: 1 });
familyMemberSchema.index({ cardId: 1 });

const FamilyMember = mongoose.model('FamilyMember', familyMemberSchema);
export default FamilyMember;
