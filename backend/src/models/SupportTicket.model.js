import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    resolvedAt: {
      type: Date,
    },
    adminNotes: {
      type: String,
    }
  },
  { timestamps: true }
);

// Auto-generate ticketId before saving
supportTicketSchema.pre('save', async function () {
  if (!this.ticketId) {
    const count = await mongoose.model('SupportTicket').countDocuments();
    this.ticketId = `TKT${String(count + 1).padStart(4, '0')}`;
  }
});

supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ userId: 1 });

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
export default SupportTicket;
