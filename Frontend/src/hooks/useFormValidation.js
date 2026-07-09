import { useState, useCallback } from 'react';
import { validateField } from '../utils/validation';

export const useFormValidation = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback((name, value) => {
    // Determine field rules (required, pattern, etc.)
    const rules = validationRules[name] || {};
    // Skip validation if not required and empty, handled in validateField
    return validateField(name, value, rules);
  }, [validationRules]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    // Automatically convert PAN and IFSC to uppercase
    let formattedVal = val;
    if (name === 'pan' || name === 'panNumber' || name === 'ifsc' || name === 'ifscCode') {
      formattedVal = typeof val === 'string' ? val.toUpperCase() : val;
    }
    // Remove spaces from Referral Code
    if (name === 'referralCode') {
      formattedVal = typeof val === 'string' ? val.replace(/\s/g, '') : val;
    }
    // Restrict Mobile to numbers and max 10 chars
    if (name === 'mobile' || name === 'phone' || name === 'phoneNumber') {
      formattedVal = typeof val === 'string' ? val.replace(/\D/g, '').substring(0, 10) : val;
    }
    // Restrict Name to alphabets and spaces only
    if (name === 'name' || name === 'fullName' || name === 'city' || name === 'state') {
      formattedVal = typeof val === 'string' ? val.replace(/[^a-zA-Z\s]/g, '') : val;
    }
    
    setValues((prev) => ({ ...prev, [name]: formattedVal }));

    // Real-time validation if field has been touched
    if (touched[name]) {
      const error = validate(name, formattedVal);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validate(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    Object.keys(validationRules).forEach(key => {
      const error = validate(key, values[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    
    // Mark all as touched on submit
    const allTouched = Object.keys(validationRules).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    return isValid;
  };

  const handleSubmit = (onSubmitFn) => async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    const isValid = validateForm();
    if (isValid) {
      setIsSubmitting(true);
      try {
        await onSubmitFn(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Helper function to reset form
  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    setErrors,
    resetForm,
    validateForm
  };
};
