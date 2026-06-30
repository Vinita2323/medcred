import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'support'],
      default: 'admin',
    },
    profilePhoto: String,
    lastLoginAt: Date,
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Tokens ─────────────────────────────────────────────────
    refreshToken: {
      type: String,
      select: false,
    },
    
    // ── Push Notification Token ────────────────────────────────
    fcmToken: String,
  },
  { timestamps: true }
);

// ── Auto-generate adminId ─────────────────────────────────────
adminSchema.pre('save', async function () {
  if (!this.adminId) {
    const count = await mongoose.model('Admin').countDocuments();
    this.adminId = `ADMIN-${String(count + 1).padStart(3, '0')}`;
  }

  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Compare password ──────────────────────────────────────────
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
