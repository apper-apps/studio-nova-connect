import { toast as reactToast } from 'react-toastify';

// Configure default options for all toasts
const defaultOptions = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'light', // Will be overridden by CSS classes for dark mode
  style: {
    fontSize: '14px',
    borderRadius: '8px',
    minHeight: '64px',
  }
};

// Create toast methods with consistent styling
export const toast = {
  success: (message, options = {}) => {
    return reactToast.success(message, { ...defaultOptions, ...options });
  },
  
  error: (message, options = {}) => {
    return reactToast.error(message, { ...defaultOptions, ...options });
  },
  
  info: (message, options = {}) => {
    return reactToast.info(message, { ...defaultOptions, ...options });
  },
  
  warning: (message, options = {}) => {
    return reactToast.warning(message, { ...defaultOptions, ...options });
  },
  
  // Generic toast method
  default: (message, options = {}) => {
    return reactToast(message, { ...defaultOptions, ...options });
  }
};

// Export individual methods for direct import
export const { success, error, info, warning } = toast;

// Default export for compatibility
export default toast;