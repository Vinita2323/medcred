import SupportTicket from '../models/SupportTicket.model.js';

// @route   POST /api/v1/support/tickets
// @desc    Create a new support ticket
// @access  Private (User only)
export const createTicket = async (req, res) => {
  try {
    const { subject, description, priority } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ success: false, message: 'Subject and description are required' });
    }

    const ticket = await SupportTicket.create({
      userId: req.user._id,
      subject,
      description,
      priority: priority || 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Create Ticket Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// @route   GET /api/v1/support/tickets
// @desc    Get all support tickets for current user
// @access  Private (User only)
export const getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    console.error('Get My Tickets Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// @route   GET /api/v1/admin/support/tickets
// @desc    Get all support tickets (Admin)
// @access  Private (Admin)
export const adminGetAllTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find()
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    console.error('Admin Get All Tickets Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// @route   PATCH /api/v1/admin/support/tickets/:id
// @desc    Update a ticket status / add admin note
// @access  Private (Admin)
export const adminUpdateTicket = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (status) {
      ticket.status = status;
      if (status === 'resolved' || status === 'closed') {
        ticket.resolvedAt = Date.now();
      }
    }
    
    if (adminNotes !== undefined) {
      ticket.adminNotes = adminNotes;
    }

    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Admin Update Ticket Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};
