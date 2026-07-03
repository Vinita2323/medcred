import FAQ from '../models/FAQ.model.js';

// @route   GET /api/v1/support/faqs
// @desc    Get all FAQs
// @access  Public / Private
export const getFAQs = async (req, res) => {
  try {
    let faqs = await FAQ.find().sort({ order: 1, createdAt: 1 });
    if (faqs.length === 0) {
      const defaultFaqs = [
        {
          question: "What is MedCred?",
          answer: "MedCred is a digital medical credit platform that helps you pay for medical treatments and hospital stays in easy, flexible monthly installments.",
          order: 1
        },
        {
          question: "How long does it take for loan approval?",
          answer: "Initial pre-approval or eligibility limit is evaluated within minutes. Final disbursement is typically completed in under 24 hours once document checks are done.",
          order: 2
        },
        {
          question: "What documents are required for KYC?",
          answer: "You need your Aadhaar card, PAN card, and a digital upload of your doctor's prescription or admission advice from a registered hospital.",
          order: 3
        },
        {
          question: "How do I pay my EMIs?",
          answer: "You can set up secure auto-debit (e-NACH) from your linked bank account, or pay manually from your wallet on the main dashboard.",
          order: 4
        },
        {
          question: "Is there any interest-free period?",
          answer: "Yes! Select premium membership plans offer 0% interest EMIs for the first 3 to 6 months depending on your eligibility card profile.",
          order: 5
        }
      ];
      await FAQ.insertMany(defaultFaqs);
      faqs = await FAQ.find().sort({ order: 1, createdAt: 1 });
    }
    res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs,
    });
  } catch (error) {
    console.error('Get FAQs Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// @route   POST /api/v1/admin/support/faqs
// @desc    Create a new FAQ (Admin)
// @access  Private (Admin)
export const createFAQ = async (req, res) => {
  try {
    const { question, answer, order } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, message: 'Question and answer are required' });
    }

    const faq = await FAQ.create({
      question,
      answer,
      order: order || 0,
    });

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: faq,
    });
  } catch (error) {
    console.error('Create FAQ Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// @route   PATCH /api/v1/admin/support/faqs/:id
// @desc    Update an FAQ (Admin)
// @access  Private (Admin)
export const updateFAQ = async (req, res) => {
  try {
    const { question, answer, order } = req.body;
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }

    if (question !== undefined) faq.question = question;
    if (answer !== undefined) faq.answer = answer;
    if (order !== undefined) faq.order = order;

    await faq.save();

    res.status(200).json({
      success: true,
      message: 'FAQ updated successfully',
      data: faq,
    });
  } catch (error) {
    console.error('Update FAQ Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// @route   DELETE /api/v1/admin/support/faqs/:id
// @desc    Delete an FAQ (Admin)
// @access  Private (Admin)
export const deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }

    res.status(200).json({
      success: true,
      message: 'FAQ deleted successfully',
    });
  } catch (error) {
    console.error('Delete FAQ Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};
