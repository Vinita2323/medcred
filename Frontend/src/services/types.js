// ─────────────────────────────────────────────────────────────────
// APP CONSTANTS & API TYPES
// ─────────────────────────────────────────────────────────────────

export const ROLES = {
  USER: 'user',
  AGENT: 'agent',
  ADMIN: 'admin',
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'medcred_access_token',
  REFRESH_TOKEN: 'medcred_refresh_token',
  USER_DATA: 'medcred_user_data',
};

export const SERVER_URL = import.meta.env.VITE_SERVER_URL || "https://medcred.onrender.com";
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://medcred.onrender.com/api/v1";

// Helper to resolve image paths from backend
const PLACEHOLDER_IMG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f0f2f5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23aaa'%3ENo Image%3C/text%3E%3C/svg%3E`;

export const getImageUrl = (path) => {
  if (!path || path.trim() === '') return PLACEHOLDER_IMG;
  if (path.startsWith('data:')) return path;            // base64 data URL
  if (path.startsWith('http')) return path;             // external URL
  if (path.startsWith('/uploads')) return PLACEHOLDER_IMG; // old broken local path
  return path;
};

// API Endpoints Mapping
export const ENDPOINTS = {
  // USER AUTH
  USER_REGISTER: '/auth/register',
  USER_VERIFY_OTP: '/auth/verify-otp',
  USER_LOGIN: '/auth/login',
  USER_FORGOT_PASSWORD: '/auth/forgot-password',
  USER_RESET_PASSWORD: '/auth/reset-password',
  USER_RESEND_OTP: '/auth/resend-otp',
  USER_SEND_LOGIN_OTP: '/auth/send-login-otp',
  USER_VERIFY_LOGIN_OTP: '/auth/verify-login-otp',

  // AGENT AUTH
  AGENT_REGISTER: '/agent/auth/register',
  AGENT_LOGIN: '/agent/auth/login',
  AGENT_SEND_OTP: '/agent/auth/send-otp',
  AGENT_VERIFY_OTP: '/agent/auth/verify-otp',
  AGENT_FORGOT_PASSWORD: '/agent/auth/forgot-password',
  AGENT_RESET_PASSWORD: '/agent/auth/reset-password',

  // ADMIN AUTH
  ADMIN_LOGIN: '/admin/auth/login',

  // PROFILE
  USER_PROFILE: '/user/profile',
  USER_DASHBOARD_STATS: '/user/profile/dashboard/stats',
  USER_WALLET: '/user/wallet',
  USER_WALLET_TRANSACTIONS: '/user/wallet/transactions',
  USER_WALLET_TOPUP: '/user/wallet/topup',
  AGENT_PROFILE: '/agent/profile',
  AGENT_DASHBOARD: '/agent/profile/dashboard',
  AGENT_CUSTOMERS: '/agent/customers',
  AGENT_ONBOARD_CUSTOMER: '/agent/customers/onboard',
  AGENT_REFERRALS: '/agent/customers/referrals',
  AGENT_WALLET: '/agent/wallet',
  AGENT_WALLET_TRANSACTIONS: '/agent/wallet/transactions',
  AGENT_WALLET_WITHDRAW: '/agent/wallet/withdraw',
  AGENT_TEAM: '/agent/team',
  AGENT_LOAN_APPLY: '/agent/loans/apply',
  ADMIN_PROFILE: '/admin/profile',

  // ADMIN — USER MANAGEMENT
  ADMIN_USERS: '/admin/users',
  ADMIN_DASHBOARD_STATS: '/admin/users/dashboard/stats',
  ADMIN_USER_STATUS: (id) => `/admin/users/${id}/status`,
  ADMIN_USER_ACTIVATE_CARD: (id) => `/admin/users/${id}/activate-card`,
  ADMIN_USER_DETAILS: (id) => `/admin/users/${id}/details`,
  ADMIN_USER_VERIFY_KYC: (id) => `/admin/users/${id}/verify-kyc`,
  ADMIN_USER_TOGGLE_LOAN_BYPASS: (id) => `/admin/users/${id}/toggle-loan-bypass`,

  // ADMIN — SETTLEMENTS
  ADMIN_SETTLEMENTS: '/admin/settlements',
  ADMIN_SETTLEMENT_APPROVE: (id) => `/admin/settlements/${id}/approve`,
  ADMIN_SETTLEMENT_REJECT: (id) => `/admin/settlements/${id}/reject`,

  // ADMIN — HOSPITALS
  ADMIN_HOSPITALS: '/admin/hospitals',
  ADMIN_HOSPITAL_UPDATE: (id) => `/admin/hospitals/${id}`,
  ADMIN_HOSPITAL_STATUS: (id) => `/admin/hospitals/${id}/status`,
  ADMIN_HOSPITAL_TOGGLE: (id) => `/admin/hospitals/${id}/toggle`,

  // ADMIN — REPORTS
  ADMIN_REPORTS: '/admin/reports',

  // ADMIN — TRANSACTIONS
  ADMIN_TRANSACTIONS: '/admin/transactions',

  // ADMIN — SUPPORT
  ADMIN_SUPPORT_TICKETS: '/admin/support/tickets',
  ADMIN_SUPPORT_TICKET_UPDATE: (id) => `/admin/support/tickets/${id}`,
  ADMIN_SUPPORT_CHAT_USERS: '/admin/support/chat/users',
  ADMIN_SUPPORT_CHAT_HISTORY: (userId) => `/admin/support/chat/history/${userId}`,
  ADMIN_SUPPORT_CHAT_SEND: '/admin/support/chat/send',
  ADMIN_SUPPORT_FAQS: '/admin/support/faqs',
  ADMIN_SUPPORT_FAQ_BY_ID: (id) => `/admin/support/faqs/${id}`,

  // ADMIN — AGENT MANAGEMENT
  ADMIN_AGENTS: '/admin/agents',
  ADMIN_AGENT_APPROVE: (id) => `/admin/agents/${id}/approve`,
  ADMIN_AGENT_STATUS: (id) => `/admin/agents/${id}/status`,
  ADMIN_AGENT_PROMOTE: (id) => `/admin/agents/${id}/promote`,

  // KYC Endpoints
  KYC_SUBMIT: '/kyc/submit',
  KYC_STATUS: '/kyc/status',

  // MEMBERSHIP & CARDS
  PLANS: '/plans',
  PLAN_BY_ID: (id) => `/plans/${id}`,
  ADMIN_UPDATE_SETTINGS: '/plans/settings',

  // PLANS
  PUBLIC_PLANS: '/plans',
  ADMIN_PLANS_UPDATE: '/plans/settings',
  ADMIN_PLAN_CREATE: '/plans',
  ADMIN_PLAN_DELETE: (id) => `/plans/${id}`,

  // ADMIN - PRODUCTS
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_PRODUCT_UPDATE: (id) => `/admin/products/${id}`,
  ADMIN_PRODUCT_DELETE: (id) => `/admin/products/${id}`,

  // ADMIN - ORDERS
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_ORDERS_PENDING_COUNT: '/admin/orders/pending-count',
  ADMIN_ORDER_UPDATE: (id) => `/admin/orders/${id}/status`,

  // HOSPITALS
  HOSPITALS: '/hospitals',

  // SUPPORT
  SUPPORT_TICKETS: '/support/tickets',
  SUPPORT_CHAT_SEND: '/support/chat/send',
  SUPPORT_CHAT_HISTORY: '/support/chat/history',
  SUPPORT_FAQS: '/support/faqs',

  ORDERS_CREATE: '/orders/create',
  PRODUCT_ORDER_CREATE: '/orders/product',
  PRODUCT_ORDER_VERIFY: '/orders/product/verify',
  ORDERS_CONFIRM: (id) => `/orders/${id}/confirm`,
  MY_ORDERS: '/orders/my-orders',
  MY_CARD: '/cards/my-card',

  PRODUCTS: '/products',

  // Family
  FAMILY_MEMBERS: '/family/members',
  FAMILY_ADD: '/family/add',
  FAMILY_REMOVE: (id) => `/family/${id}`,

  // ADMIN - FAMILY MANAGEMENT
  ADMIN_KYC: '/admin/kyc',
  ADMIN_KYC_UPDATE: (id) => `/admin/kyc/${id}`,
  ADMIN_FAMILY_MEMBERS: '/admin/family',
  ADMIN_FAMILY_VERIFY: (id) => `/admin/family/${id}/verify`,

  // LOANS
  LOAN_ELIGIBILITY: '/loans/eligibility',
  LOAN_APPLY: '/loans/apply',
  MY_LOAN: '/loans/my-loan',
  LOAN_HISTORY: '/loans/history',

  // ADMIN - LOANS
  ADMIN_LOANS: '/admin/loans',
  ADMIN_LOAN_UPDATE: (id) => `/admin/loans/${id}`,

  // CLAIMS
  CLAIMS_SUBMIT: '/claims/submit',
  MY_CLAIMS: '/claims/my-claims',

  // ADMIN - CLAIMS
  ADMIN_CLAIMS: '/admin/claims',
  ADMIN_CLAIM_UPDATE: (id) => `/admin/claims/${id}`,

  // COMMON AUTH
  AUTH_REFRESH: '/auth/refresh',
  AUTH_LOGOUT: '/auth/logout',
};
