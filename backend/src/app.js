import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Routes
import otpRoutes from './routes/otp.routes.js';
import userAuthRoutes from './routes/user.auth.routes.js';
import agentAuthRoutes from './routes/agent.auth.routes.js';
import adminAuthRoutes from './routes/admin.auth.routes.js';
import authRefreshRoutes from './routes/auth.refresh.routes.js';
import userProfileRoutes from './routes/user.profile.routes.js';
import agentProfileRoutes from './routes/agent.profile.routes.js';
import adminProfileRoutes from './routes/admin.profile.routes.js';
import adminAgentRoutes from './routes/admin.agent.routes.js';
import planRoutes from './routes/plan.routes.js';
import orderRoutes from './routes/order.routes.js';
import cardRoutes from './routes/card.routes.js';
import familyRoutes from './routes/family.routes.js';
import adminFamilyRoutes from './routes/admin.family.routes.js';
import loanRoutes from './routes/loan.routes.js';
import adminLoanRoutes from './routes/admin.loan.routes.js';
import kycRoutes from './routes/kyc.routes.js';
import adminKycRoutes from './routes/admin.kyc.routes.js';
import adminUserRoutes from './routes/admin.user.routes.js';
import claimRoutes from './routes/claims.routes.js';
import adminClaimRoutes from './routes/admin.claims.routes.js';
import agentCustomerRoutes from './routes/agent.customer.routes.js';
import agentWalletRoutes from './routes/agent.wallet.routes.js';
import agentTeamRoutes from './routes/agent.team.routes.js';
import agentLoanRoutes from './routes/agent.loan.routes.js';
import adminSettlementRoutes from './routes/admin.settlement.routes.js';
import adminHospitalRoutes from './routes/admin.hospital.routes.js';
import adminReportsRoutes from './routes/admin.reports.routes.js';
import adminTransactionsRoutes from './routes/admin.transactions.routes.js';
import userWalletRoutes from './routes/user.wallet.routes.js';
import productRoutes from './routes/product.routes.js';
import hospitalRoutes from './routes/hospital.routes.js';
import supportRoutes from './routes/support.routes.js';
import adminSupportRoutes from './routes/admin.support.routes.js';
import adminProductRoutes from './routes/admin.product.routes.js';
import adminOrderRoutes from './routes/admin.order.routes.js';
import notificationRoutes from './routes/notification.routes.js';
const app = express();

// ── Security Middleware ────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// ── CORS — Allow React frontend ────────────────────────────────
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', "https://medcred-nu.vercel.app"],
    credentials: true,
  })
);

import path from 'path';

// ── Body Parser ────────────────────────────────────────────────
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve static files for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// ── Request Logger (dev only) ──────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Health Check ───────────────────────────────────────────────
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🏥 MedCred API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/auth', otpRoutes);
app.use('/api/v1/auth', otpRoutes);
app.use('/api/v1/auth', userAuthRoutes);
app.use('/api/v1/auth', authRefreshRoutes);
app.use('/api/v1/agent/auth', agentAuthRoutes);
app.use('/api/v1/admin/auth', adminAuthRoutes);
app.use('/api/v1/user/profile', userProfileRoutes);
app.use('/api/v1/agent/profile', agentProfileRoutes);
app.use('/api/v1/admin/profile', adminProfileRoutes);
app.use('/api/v1/admin/agents', adminAgentRoutes);
app.use('/api/v1/plans', planRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/cards', cardRoutes);
app.use('/api/v1/family', familyRoutes);
app.use('/api/v1/admin/family', adminFamilyRoutes);
app.use('/api/v1/loans', loanRoutes);
app.use('/api/v1/admin/loans', adminLoanRoutes);
app.use('/api/v1/kyc', kycRoutes);
app.use('/api/v1/admin/kyc', adminKycRoutes);
app.use('/api/v1/admin/users', adminUserRoutes);
app.use('/api/v1/claims', claimRoutes);
app.use('/api/v1/admin/claims', adminClaimRoutes);
app.use('/api/v1/agent/customers', agentCustomerRoutes);
app.use('/api/v1/agent/wallet', agentWalletRoutes);
app.use('/api/v1/agent/team', agentTeamRoutes);
app.use('/api/v1/agent/loans', agentLoanRoutes);
app.use('/api/v1/admin/settlements', adminSettlementRoutes);
app.use('/api/v1/admin/hospitals', adminHospitalRoutes);
app.use('/api/v1/admin/reports', adminReportsRoutes);
app.use('/api/v1/admin/transactions', adminTransactionsRoutes);
app.use('/api/v1/user/wallet', userWalletRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/admin/products', adminProductRoutes);
app.use('/api/v1/admin/orders', adminOrderRoutes);
app.use('/api/v1/hospitals', hospitalRoutes);
app.use('/api/v1/support', supportRoutes);
app.use('/api/v1/admin/support', adminSupportRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// ── 404 Handler ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Global Error:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;
