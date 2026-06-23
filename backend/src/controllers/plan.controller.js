import Plan from '../models/Plan.model.js';

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/v1/plans
// @desc    Get all active membership plans
// @access  Public (or protected based on routes)
// ─────────────────────────────────────────────────────────────────
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ price: 1 });
    res.status(200).json({ success: true, count: plans.length, data: plans });
  } catch (error) {
    console.error('Get Plans Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching plans.' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/v1/plans/:id
// @desc    Get a single plan by its object ID or planId string
// @access  Public
// ─────────────────────────────────────────────────────────────────
export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    let plan;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      plan = await Plan.findById(id);
    } else {
      plan = await Plan.findOne({ planId: id });
    }

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found.' });
    }
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    console.error('Get Plan By ID Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching plan.' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   PATCH /api/v1/plans/settings
// @desc    Admin bulk update platform settings (Global Limits + Plan Pricing)
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────
export const adminUpdateSettings = async (req, res) => {
  try {
    const { limits, plans } = req.body;

    // 1. Update Global Limits for ALL plans
    if (limits) {
      await Plan.updateMany({}, {
        $set: {
          hospitalClaimLimit: limits.hospitalClaimLimit,
          homeTreatmentClaimLimit: limits.homeClaimLimit,
          loanEligibilityAfterDays: limits.loanWaitDays
        }
      });
    }

    // 2. Update Specific Plan Pricing & Validity
    if (plans) {
      // expected format: plans: { individual: { price: 499, validity: '1 Year' }, family: {...}, premium: {...} }
      for (const [planId, planData] of Object.entries(plans)) {
        await Plan.updateOne(
          { planId },
          { $set: { price: planData.price, validity: planData.validity } }
        );
      }
    }

    res.status(200).json({
      success: true,
      message: 'Platform settings updated successfully globally.'
    });
  } catch (error) {
    console.error('Admin Update Settings Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating settings.' });
  }
};
