export const VALIDATION_RULES = {
  // Mobile: 10 digits, starting with 6,7,8,9
  MOBILE: /^[6-9]\d{9}$/,
  
  // Email: Standard email regex
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  
  // Full Name: Only alphabets and spaces, 2-50 chars
  FULL_NAME: /^[a-zA-Z\s]{2,50}$/,
  
  // City/State: Only alphabets and spaces, min 2 chars
  ALPHA_SPACE: /^[a-zA-Z\s]{2,50}$/,
  
  // Bank Account: Numeric, 9-18 digits
  BANK_ACCOUNT: /^\d{9,18}$/,
  
  // IFSC Code: 4 chars + 0 + 6 alphanumeric
  IFSC: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  
  // PAN Number: 5 chars + 4 numbers + 1 char
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  
  // Aadhaar Number: Exactly 12 digits
  AADHAAR: /^\d{12}$/,
  
  // PIN Code: Exactly 6 digits
  PIN_CODE: /^\d{6}$/,
  
  // Referral Code: Alphanumeric only
  REFERRAL_CODE: /^[a-zA-Z0-9]{3,20}$/,
};

export const validateField = (name, value, customRules = {}) => {
  const val = typeof value === 'string' ? value.trim() : value;
  
  // Check required
  if (customRules.required && (!val || val.length === 0)) {
    return 'This field is required';
  }

  // If empty and not required, it's valid
  if (!val) return '';

  switch (name) {
    case 'fullName':
    case 'name':
      if (!VALIDATION_RULES.FULL_NAME.test(val)) {
        return 'Enter a valid name (alphabets and spaces only, 2-50 chars)';
      }
      break;
    
    case 'mobile':
    case 'phone':
    case 'phoneNumber':
      if (!VALIDATION_RULES.MOBILE.test(val)) {
        return 'Enter a valid 10-digit mobile number starting with 6-9';
      }
      break;

    case 'email':
      if (!VALIDATION_RULES.EMAIL.test(val)) {
        return 'Enter a valid email address (e.g., name@example.com)';
      }
      break;

    case 'password':
      if (!VALIDATION_RULES.PASSWORD.test(val)) {
        return 'Password must be at least 8 chars long with 1 uppercase, 1 lowercase, 1 number, and 1 special character';
      }
      break;

    case 'bankAccount':
    case 'accountNumber':
      if (!VALIDATION_RULES.BANK_ACCOUNT.test(val)) {
        return 'Enter a valid bank account number (9-18 digits)';
      }
      break;

    case 'ifscCode':
    case 'ifsc':
      if (!VALIDATION_RULES.IFSC.test(val.toUpperCase())) {
        return 'Enter a valid IFSC code (e.g., SBIN0001234)';
      }
      break;

    case 'panNumber':
    case 'pan':
      if (!VALIDATION_RULES.PAN.test(val.toUpperCase())) {
        return 'Enter a valid PAN number (e.g., ABCDE1234F)';
      }
      break;

    case 'aadhaarNumber':
    case 'aadhaar':
      if (!VALIDATION_RULES.AADHAAR.test(val)) {
        return 'Enter a valid 12-digit Aadhaar number';
      }
      break;

    case 'pinCode':
    case 'pincode':
    case 'zipCode':
      if (!VALIDATION_RULES.PIN_CODE.test(val)) {
        return 'Enter a valid 6-digit PIN code';
      }
      break;

    case 'city':
    case 'state':
    case 'district':
      if (!VALIDATION_RULES.ALPHA_SPACE.test(val)) {
        return 'Enter a valid name (alphabets and spaces only)';
      }
      break;

    case 'referralCode':
      if (!VALIDATION_RULES.REFERRAL_CODE.test(val)) {
        return 'Enter a valid referral code (alphanumeric only)';
      }
      break;

    case 'address':
    case 'street':
      if (val.length < 5) {
        return 'Address must be at least 5 characters long';
      }
      break;

    default:
      // Custom generic regex support
      if (customRules.pattern && !customRules.pattern.test(val)) {
        return customRules.message || 'Invalid format';
      }
      break;
  }
  
  return '';
};
