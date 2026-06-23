import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Nested location (per DB schema)
    location: {
      address: { type: String, default: '' },
      city:    { type: String, default: '' },
      state:   { type: String, default: '' },
      pincode: { type: String, default: '' },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },

    // Nested contact (per DB schema)
    contact: {
      phone:   { type: String, default: '' },
      email:   { type: String, default: '' },
      website: { type: String, default: '' },
    },

    // Network flags
    isClaimEnabled:     { type: Boolean, default: false },
    isNetworkHospital:  { type: Boolean, default: false },
    supportedClaimTypes: [{
      type: String,
      enum: ['hospital', 'home_treatment'],
    }],

    // Status
    status: {
      type: String,
      enum: ['pending', 'active', 'inactive', 'rejected'],
      default: 'pending',
    },
    isVerified:  { type: Boolean, default: false },
    verifiedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    verifiedAt:  { type: Date },

    // Meta
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    logoUrl: { type: String },
  },
  { timestamps: true }
);

// Auto-generate hospitalId before validate
hospitalSchema.pre('validate', async function () {
  if (!this.hospitalId) {
    const count = await mongoose.model('Hospital').countDocuments();
    this.hospitalId = `HOS${String(count + 1).padStart(3, '0')}`;
  }
});

// Indexes
hospitalSchema.index({ status: 1 });
hospitalSchema.index({ name: 'text', 'location.city': 'text' });

const Hospital = mongoose.model('Hospital', hospitalSchema);
export default Hospital;
