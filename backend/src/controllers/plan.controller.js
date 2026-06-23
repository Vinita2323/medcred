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

    // 2. Update Specific Plan Pricing, Validity & Commissions
    if (plans) {
      for (const [planId, planData] of Object.entries(plans)) {
        const updateFields = {};
        if (planData.price !== undefined) updateFields.price = planData.price;
        if (planData.validity !== undefined) updateFields.validity = planData.validity;
        if (planData.maxMembers !== undefined) updateFields.maxMembers = planData.maxMembers;
        if (planData.coverageAmount !== undefined) updateFields.coverageAmount = planData.coverageAmount;
        if (planData.isActive !== undefined) updateFields.isActive = planData.isActive;
        if (planData.fieldAgentCommissionPct !== undefined) updateFields.fieldAgentCommissionPct = planData.fieldAgentCommissionPct;
        if (planData.agentCommissionPct !== undefined) updateFields.agentCommissionPct = planData.agentCommissionPct;
        if (planData.superAgentCommissionPct !== undefined) updateFields.superAgentCommissionPct = planData.superAgentCommissionPct;

        if (Object.keys(updateFields).length > 0) {
          await Plan.updateOne(
            { planId },
            { $set: updateFields }
          );
        }
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

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/v1/plans
// @desc    Admin create new plan
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────
export const createPlan = async (req, res) => {
  try {
    const { name, price, maxMembers, coverageAmount, validity } = req.body;
    const planId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Copy default limits from existing plan or use defaults
    const existingPlan = await Plan.findOne();
    
    const newPlan = new Plan({
      planId,
      name,
      price,
      maxMembers,
      coverageAmount,
      validity,
      validityDays: parseInt(validity) ? parseInt(validity) * 365 : 365,
      isActive: true,
      hospitalClaimLimit: existingPlan?.hospitalClaimLimit || 50000,
      homeTreatmentClaimLimit: existingPlan?.homeTreatmentClaimLimit || 10000,
      features: ['Access to 5000+ Hospitals', '24x7 Support', 'No wait time'],
    });

    await newPlan.save();
    
    res.status(201).json({
      success: true,
      message: 'Plan created successfully.',
      data: newPlan
    });
  } catch (error) {
    console.error('Create Plan Error:', error);
    res.status(500).json({ success: false, message: 'Server error creating plan.', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   DELETE /api/v1/plans/:id
// @desc    Admin delete plan
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    let plan;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      plan = await Plan.findByIdAndDelete(id);
    } else {
      plan = await Plan.findOneAndDelete({ planId: id });
    }

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found.' });
    }

    res.status(200).json({ success: true, message: 'Plan deleted successfully.' });
  } catch (error) {
    console.error('Delete Plan Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting plan.' });
  }
};
