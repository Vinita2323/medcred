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
    origin: ['http://localhost:5173', 'http://localhost:3000', "https://medcred-nu.vercel.app", "https://medcred.in", "https://www.medcred.in"],
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

// ── API Router ──────────────────────────────────────────────────
const apiRouter = express.Router();

// ── Health Check ───────────────────────────────────────────────
apiRouter.get('/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🏥 MedCred API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ─────────────────────────────────────────────────────
apiRouter.use('/auth', otpRoutes);
apiRouter.use('/v1/auth', otpRoutes);
apiRouter.use('/v1/auth', userAuthRoutes);
apiRouter.use('/v1/auth', authRefreshRoutes);
apiRouter.use('/v1/agent/auth', agentAuthRoutes);
apiRouter.use('/v1/admin/auth', adminAuthRoutes);
apiRouter.use('/v1/user/profile', userProfileRoutes);
apiRouter.use('/v1/agent/profile', agentProfileRoutes);
apiRouter.use('/v1/admin/profile', adminProfileRoutes);
apiRouter.use('/v1/admin/agents', adminAgentRoutes);
apiRouter.use('/v1/plans', planRoutes);
apiRouter.use('/v1/orders', orderRoutes);
apiRouter.use('/v1/cards', cardRoutes);
apiRouter.use('/v1/family', familyRoutes);
apiRouter.use('/v1/admin/family', adminFamilyRoutes);
apiRouter.use('/v1/loans', loanRoutes);
apiRouter.use('/v1/admin/loans', adminLoanRoutes);
apiRouter.use('/v1/kyc', kycRoutes);
apiRouter.use('/v1/admin/kyc', adminKycRoutes);
apiRouter.use('/v1/admin/users', adminUserRoutes);
apiRouter.use('/v1/claims', claimRoutes);
apiRouter.use('/v1/admin/claims', adminClaimRoutes);
apiRouter.use('/v1/agent/customers', agentCustomerRoutes);
apiRouter.use('/v1/agent/wallet', agentWalletRoutes);
apiRouter.use('/v1/agent/team', agentTeamRoutes);
apiRouter.use('/v1/agent/loans', agentLoanRoutes);
apiRouter.use('/v1/admin/settlements', adminSettlementRoutes);
apiRouter.use('/v1/admin/hospitals', adminHospitalRoutes);
apiRouter.use('/v1/admin/reports', adminReportsRoutes);
apiRouter.use('/v1/admin/transactions', adminTransactionsRoutes);
apiRouter.use('/v1/user/wallet', userWalletRoutes);
apiRouter.use('/v1/products', productRoutes);
apiRouter.use('/v1/admin/products', adminProductRoutes);
apiRouter.use('/v1/admin/orders', adminOrderRoutes);
apiRouter.use('/v1/hospitals', hospitalRoutes);
apiRouter.use('/v1/support', supportRoutes);
apiRouter.use('/v1/admin/support', adminSupportRoutes);
apiRouter.use('/v1/notifications', notificationRoutes);

// Register the router for both /api and root / paths
app.use('/api', apiRouter);
app.use('/', apiRouter);

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
