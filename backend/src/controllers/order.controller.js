import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import Card from '../models/Card.model.js';
import Plan from '../models/Plan.model.js';
import Agent from '../models/Agent.model.js';
import User from '../models/User.model.js';
import FamilyMember from '../models/FamilyMember.model.js';
import Wallet from '../models/Wallet.model.js';
import Transaction from '../models/Transaction.model.js';
// ─────────────────────────────────────────────────────────────────
// @route   POST /api/v1/orders/create
// @desc    Create a new membership card order
// @access  Private (User only)
// ─────────────────────────────────────────────────────────────────
export const createOrder = async (req, res) => {
  try {
    const { planId, referralCode, agentDetail, discount = 0 } = req.body;

    // 1. Check if user already has an active card
    const existingCard = await Card.findOne({ userId: req.user._id, status: 'active' });
    if (existingCard) {
      return res.status(400).json({ success: false, message: 'You already have an active membership card.' });
    }

    // 2. Fetch Plan
    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ success: false, message: 'Selected plan is not available.' });
    }

    // 3. Resolve Agent if referral code provided
    let resolvedAgentId = null;
    if (referralCode) {
      const agent = await Agent.findOne({ referralCode: referralCode.toUpperCase(), status: 'Approved' });
      if (agent) {
        resolvedAgentId = agent._id;
      }
    }

    // 4. Create Order
    const orderId = `ORD-${Date.now()}`;
    const finalAmount = plan.price - discount;

    const newOrder = await Order.create({
      orderId,
      userId: req.user._id,
      orderType: 'membership_card',
      planId: plan._id,
      planName: plan.name,
      baseAmount: plan.price,
      discountAmount: discount,
      finalAmount: finalAmount > 0 ? finalAmount : 0,
      referralCode,
      agentId: resolvedAgentId,
      agentDetail,
      paymentStatus: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      data: newOrder,
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ success: false, message: 'Server error while creating order.' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/v1/orders/:orderId/confirm
// @desc    Confirm payment and auto-create digital health card
// @access  Private (User only)
// ─────────────────────────────────────────────────────────────────
export const confirmPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentMethod, paymentDetails } = req.body;

    const order = await Order.findOne({ orderId, userId: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.paymentStatus === 'success') {
      return res.status(400).json({ success: false, message: 'Order is already paid.' });
    }

    // 1. Mark order as paid
    order.paymentStatus = 'success';
    order.paymentMethod = paymentMethod;
    order.paymentDetails = paymentDetails;
    order.paidAt = new Date();
    order.invoiceNumber = `MC-${Math.floor(100000 + Math.random() * 900000)}`;
    await order.save();

    // 2. Fetch Plan details for card creation
    const plan = await Plan.findById(order.planId);

    // 3. Auto-generate Card Number & ID
    // cardNumber format: XXXX XXXX XXXX XXXX
    const c1 = Math.floor(1000 + Math.random() * 9000);
    const c2 = Math.floor(1000 + Math.random() * 9000);
    const c3 = Math.floor(1000 + Math.random() * 9000);
    const c4 = Math.floor(1000 + Math.random() * 9000);
    const cardNumber = `${c1} ${c2} ${c3} ${c4}`;
    
    // cardId format: MC-XXXX-XXXX
    const cardId = `MC-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const now = new Date();
    const validTill = new Date(now);
    validTill.setDate(validTill.getDate() + (plan.validityDays || 365));

    const loanEligibleFrom = new Date(now);
    loanEligibleFrom.setDate(loanEligibleFrom.getDate() + (plan.loanEligibilityAfterDays || 30));

    // 4. Create the Card
    const newCard = await Card.create({
      cardNumber,
      cardId,
      userId: req.user._id,
      planId: plan._id,
      planName: plan.name,
      cardType: plan.planId, // 'individual', 'family', 'premium'
      purchasePrice: order.finalAmount,
      coverageAmount: plan.coverageAmount,
      creditLimit: plan.maxLoanAmount || 50000,
      purchasedAt: now,
      validFrom: now,
      validTill: validTill,
      status: 'active',
      orderId: order._id,
      paymentMethod,
      agentId: order.agentId,
      referralCodeUsed: order.referralCode,
      loanEligibleFrom,
      isLoanEligible: false, // Starts as false, cron or API will update after 30 days
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + cardId,
    });

    // 5. Link Card to Order and User
    order.cardId = newCard._id;
    await order.save();

    await User.findByIdAndUpdate(req.user._id, { cardId: newCard._id });

    // 6. Auto-seed "Self" family member
    const selfMemberId = 'FM' + Date.now() + Math.floor(Math.random() * 1000);
    await FamilyMember.create({
      memberId: selfMemberId,
      primaryUserId: req.user._id,
      primaryUserName: req.user.name || req.user.fullName || 'User',
      cardId: newCard._id,
      name: req.user.name || req.user.fullName || 'Card Holder',
      relationship: 'Self',
      dob: req.user.dob || new Date(), // fallback to today if dob not found
      age: req.user.dob ? (new Date().getFullYear() - new Date(req.user.dob).getFullYear()) : 0,
      gender: req.user.gender,
      bloodGroup: req.user.bloodGroup,
      profilePhoto: req.user.profilePic || req.user.profilePhoto || null,
      isVerified: true, // Self is considered verified
      verificationStatus: 'verified',
      status: 'active',
      isClaimEligible: true,
      verifiedAt: now,
    });

    // 7. Credit Agent wallet/commission (MLM Payout)
    if (order.agentId) {
      // Helper function to pay an agent
      const payAgentCommission = async (agentId, percentage, description) => {
        const commissionAmount = (order.finalAmount * percentage) / 100;
        if (commissionAmount <= 0) return;

        let wallet = await Wallet.findOne({ ownerId: agentId, ownerType: 'Agent' });
        if (!wallet) {
          wallet = new Wallet({
            ownerId: agentId,
            ownerType: 'Agent',
            totalEarnings: 0,
            withdrawableBalance: 0,
            pendingCommissions: 0,
            paidEarnings: 0,
          });
        }

        wallet.totalEarnings += commissionAmount;
        wallet.withdrawableBalance += commissionAmount;
        await wallet.save();

        await Agent.findByIdAndUpdate(agentId, {
          $inc: {
            salesCount: 1, // We increment sales count for everyone in the chain
            earnings: commissionAmount
          }
        });

        await Transaction.create({
          transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          walletId: wallet._id,
          ownerId: agentId,
          ownerType: 'Agent',
          type: 'credit',
          category: 'agent_commission',
          amount: commissionAmount,
          relatedEntityId: order._id,
          relatedEntityType: 'Order',
          sourceDescription: 'Card Sale Commission',
          detailDescription: `${description} for ${order.planName} sale (User: ${req.user.name || req.user.fullName || 'User'})`,
        });
      };

      // 7a. Direct Seller always gets base commission (fieldAgentCommissionPct)
      const directSeller = await Agent.findById(order.agentId);
      if (directSeller) {
        const baseComm = plan.fieldAgentCommissionPct || 12;
        await payAgentCommission(directSeller._id, baseComm, `Direct Sale ${baseComm}% commission`);

        // 7b. Check for Upline 1 (Parent Agent)
        if (directSeller.reportingManagerId) {
          const parentAgent = await Agent.findById(directSeller.reportingManagerId);
          
          if (parentAgent) {
            // Pay Parent Agent depending on their role
            if (parentAgent.role === 'Agent') {
              const agentComm = plan.agentCommissionPct || 4;
              await payAgentCommission(parentAgent._id, agentComm, `Upline Agent ${agentComm}% override`);
            } else if (parentAgent.role === 'Super Agent') {
              // If direct seller's parent is immediately a Super Agent
              const saComm = plan.superAgentCommissionPct || 3;
              await payAgentCommission(parentAgent._id, saComm, `Upline Super Agent ${saComm}% override`);
            }

            // 7c. Check for Upline 2 (Grandparent Super Agent)
            if (parentAgent.reportingManagerId && parentAgent.role !== 'Super Agent') {
              const grandParentAgent = await Agent.findById(parentAgent.reportingManagerId);
              if (grandParentAgent && grandParentAgent.role === 'Super Agent') {
                const saComm = plan.superAgentCommissionPct || 3;
                await payAgentCommission(grandParentAgent._id, saComm, `Upline Super Agent ${saComm}% override`);
              }
            }
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment confirmed and card generated successfully.',
      data: {
        order,
        card: newCard,
      },
    });
  } catch (error) {
    console.error('Confirm Payment Error:', error);
    res.status(500).json({ success: false, message: 'Server error confirming payment.' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/v1/orders/product
// @desc    Create a new product order (Medical Equipment)
// @access  Private (User only)
// ─────────────────────────────────────────────────────────────────
export const createProductOrder = async (req, res) => {
  try {
    const { productId, deliveryAddress, paymentMethod, paymentDetails } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isAvailable) {
      return res.status(404).json({ success: false, message: 'Product not found or unavailable.' });
    }

    const orderId = `ORD-${Date.now()}`;
    const finalAmount = product.discountedPrice || product.price;

    // Calculate delivery (e.g., +5-7 days)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

    const newOrder = await Order.create({
      orderId,
      userId: req.user._id,
      orderType: 'medical_equipment',
      productId: product._id,
      productName: product.name,
      baseAmount: product.price,
      finalAmount: finalAmount,
      deliveryAddress,
      estimatedDelivery,
      paymentMethod,
      paymentDetails,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'success', // Fake success for digital payments for now
      paidAt: paymentMethod === 'cod' ? null : new Date(),
      invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
    });

    res.status(201).json({
      success: true,
      message: 'Product order created successfully.',
      data: newOrder,
    });
  } catch (error) {
    console.error('Create Product Order Error:', error);
    res.status(500).json({ success: false, message: 'Server error while creating product order.' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/v1/orders/my-orders
// @desc    Get user's orders (both cards and products)
// @access  Private (User only)
// ─────────────────────────────────────────────────────────────────
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('productId', 'imageUrl category') // Bring image for UI
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Get My Orders Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching orders.' });
  }
};
