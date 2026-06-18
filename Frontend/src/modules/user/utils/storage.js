// ─── MedCred LocalStorage Utility ────────────────────────────────────────────
const KEYS = {
  USER:       'medcred_user',
  FAMILY:     'medcred_family',
  LOGGED_IN:  'medcred_logged_in',
  MEMBERSHIP: 'medcred_membership',
  KYC:        'medcred_kyc',
};

// ── User Profile ──────────────────────────────────────────────────────────────
export function saveUser(userData) {
  localStorage.setItem(KEYS.USER, JSON.stringify(userData));
}
export function getUser() {
  try { return JSON.parse(localStorage.getItem(KEYS.USER)) || null; }
  catch { return null; }
}
export function updateUser(fields) {
  saveUser({ ...(getUser() || {}), ...fields });
}
export function clearUser() {
  [KEYS.USER, KEYS.LOGGED_IN, KEYS.MEMBERSHIP, KEYS.KYC, KEYS.FAMILY]
    .forEach(k => localStorage.removeItem(k));
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export function setLoggedIn(value) {
  localStorage.setItem(KEYS.LOGGED_IN, value ? 'true' : 'false');
}
export function isLoggedIn() {
  return localStorage.getItem(KEYS.LOGGED_IN) === 'true';
}

// ── Family Members ────────────────────────────────────────────────────────────
export function getFamilyMembers() {
  try { return JSON.parse(localStorage.getItem(KEYS.FAMILY)) || []; }
  catch { return []; }
}
export function saveFamilyMembers(members) {
  localStorage.setItem(KEYS.FAMILY, JSON.stringify(members));
}
export function addFamilyMember(member) {
  const current = getFamilyMembers();
  const newId = `MC-${Math.floor(80000 + Math.random() * 19999)}`;
  const newMember = { ...member, id: newId, verified: false };
  saveFamilyMembers([...current, newMember]);
  return newMember;
}
export function removeFamilyMember(id) {
  saveFamilyMembers(getFamilyMembers().filter(m => m.id !== id));
}
export function seedSelfMember(user) {
  const existing = getFamilyMembers();
  if (!existing.some(m => m.relationship === 'Self')) {
    saveFamilyMembers([{
      id: 'MC-SELF',
      name: user.name,
      relationship: 'Self',
      age: user.dob ? getAgeFromDob(user.dob) : '',
      dob: user.dob || '',
      bloodGroup: user.bloodGroup || '',
      gender: user.gender || '',
      verified: true,
      image: user.profilePic || null,
    }, ...existing]);
  }
}

// ── KYC ───────────────────────────────────────────────────────────────────────
export function saveKyc(kycData) {
  localStorage.setItem(KEYS.KYC, JSON.stringify({
    ...kycData,
    submittedAt: new Date().toISOString(),
    status: 'pending', // pending | verified | rejected
  }));
}
export function getKyc() {
  try { return JSON.parse(localStorage.getItem(KEYS.KYC)) || null; }
  catch { return null; }
}
export function updateKycStatus(status) {
  const kyc = getKyc();
  if (kyc) localStorage.setItem(KEYS.KYC, JSON.stringify({ ...kyc, status }));
}
export function isKycVerified() {
  const kyc = getKyc();
  return kyc?.status === 'verified';
}

// ── Membership ────────────────────────────────────────────────────────────────
export const DEFAULT_PLANS = {
  individual: {
    id: 'individual',
    name: 'Individual Plan',
    price: 999,
    members: 1,
    coverage: '₹2,00,000',
    validity: '1 Year',
    color: 'plan-individual',
    features: [
      'Hospital Cashless Claims',
      'OPD Consultation Cover',
      'Medicine Reimbursement',
      'Emergency Ambulance',
      'Loan Eligibility (after 30 days)',
    ],
    isHidden: false,
  },
  family: {
    id: 'family',
    name: 'Family Plan',
    price: 2499,
    members: 4,
    coverage: '₹3,00,000',
    validity: '1 Year',
    color: 'plan-family',
    popular: true,
    features: [
      'All Individual Benefits',
      'Includes Parents & In-laws',
      'Up to 4 Family Members',
      'Family Floater Coverage',
      'Higher Loan Eligibility',
    ],
    isHidden: false,
  },
  premium: {
    id: 'premium',
    name: 'Premium Family',
    price: 4999,
    members: 6,
    coverage: '₹5,00,000',
    validity: '1 Year',
    color: 'plan-premium',
    features: [
      'All Family Plan Benefits',
      'Includes Parents & In-laws',
      'Up to 6 Family Members',
      'International Coverage',
      'Dedicated Health Manager',
    ],
    isHidden: false,
  },
};

export function getPlatformPlans() {
  try { 
    const stored = JSON.parse(localStorage.getItem('medcred_platform_plans'));
    if (stored && Object.keys(stored).length > 0) return stored;
  } catch {}
  return DEFAULT_PLANS;
}

export function savePlatformPlans(plansObj) {
  localStorage.setItem('medcred_platform_plans', JSON.stringify(plansObj));
}

export function saveMembership(planId, paymentData = {}) {
  const plans = getPlatformPlans();
  const plan = plans[planId];
  const now = new Date();
  const expiry = new Date(now);
  expiry.setFullYear(expiry.getFullYear() + 1);
  localStorage.setItem(KEYS.MEMBERSHIP, JSON.stringify({
    planId,
    planName: plan.name,
    price: plan.price,
    coverage: plan.coverage,
    maxMembers: plan.members,
    purchasedAt: now.toISOString(),
    expiresAt: expiry.toISOString(),
    cardNumber: generateCardNumber(),
    status: 'active', // active | expired
    paymentMethod: paymentData.method || 'UPI',
    transactionId: paymentData.txnId || generateTxnId(),
  }));
}
export function getMembership() {
  try { return JSON.parse(localStorage.getItem(KEYS.MEMBERSHIP)) || null; }
  catch { return null; }
}
export function hasMembership() {
  const m = getMembership();
  if (!m) return false;
  return m.status === 'active' && new Date(m.expiresAt) > new Date();
}
export function getDaysActive() {
  const m = getMembership();
  if (!m) return 0;
  const diff = new Date() - new Date(m.purchasedAt);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
export function isLoanEligible() {
  return hasMembership() && getDaysActive() >= 30;
}
export function getDaysUntilLoanEligible() {
  if (!hasMembership()) return null;
  const remaining = 30 - getDaysActive();
  return remaining > 0 ? remaining : 0;
}
export function getMembershipDaysRemaining() {
  const m = getMembership();
  if (!m) return 0;
  const diff = new Date(m.expiresAt) - new Date();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

// ── Helpers ──────────────────────────────────────────────────────────────────
export function getAgeFromDob(dobString) {
  if (!dobString) return '';
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age > 0 ? `${age} Years` : 'Infant';
}
export function formatDobDisplay(dobString) {
  if (!dobString) return '';
  return new Date(dobString).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}
function generateCardNumber() {
  return Array.from({ length: 4 }, () =>
    Math.floor(1000 + Math.random() * 9000)
  ).join(' ');
}
function generateTxnId() {
  return 'MC' + Date.now().toString(36).toUpperCase();
}
