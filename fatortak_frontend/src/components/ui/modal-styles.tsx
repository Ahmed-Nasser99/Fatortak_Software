
import React from 'react';

export const ModalOverlay: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    {children}
  </div>
);

export const ModalContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => (
  <div className={`bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

export const ModalHeader: React.FC<{ 
  children: React.ReactNode; 
  onClose: () => void;
  isRTL?: boolean;
}> = ({ children, onClose, isRTL = false }) => (
  <div className={`flex items-center justify-between p-8 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 ${isRTL ? 'flex-row-reverse' : ''}`}>
    {children}
    <button
      onClick={onClose}
      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-200"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
);

export const ModalContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => (
  <div className={`p-8 ${className}`}>
    {children}
  </div>
);

export const ModalFooter: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  isRTL?: boolean;
}> = ({ children, className = "", isRTL = false }) => (
  <div className={`flex space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700 ${isRTL ? 'flex-row-reverse space-x-reverse' : 'justify-end'} ${className}`}>
    {children}
  </div>
);

export const FormGroup: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`space-y-3 ${className}`}>
    {children}
  </div>
);

export const FormLabel: React.FC<{ 
  children: React.ReactNode; 
  icon?: React.ReactNode;
}> = ({ children, icon }) => (
  <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
    {icon && <span className="w-4 h-4 mr-2 text-purple-600">{icon}</span>}
    {children}
  </label>
);

export const StyledInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ 
  className = "", 
  ...props 
}) => (
  <input
    {...props}
    className={`h-12 w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 focus:border-purple-500 focus:outline-none transition-all duration-200 px-4 ${className}`}
  />
);

export const StyledTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ 
  className = "", 
  ...props 
}) => (
  <textarea
    {...props}
    className={`w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 focus:border-purple-500 focus:outline-none transition-all duration-200 p-4 resize-none ${className}`}
  />
);

export const StyledButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
}> = ({ 
  variant = 'primary', 
  className = "", 
  children,
  ...props 
}) => {
  const baseClasses = "px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white",
    secondary: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white",
    outline: "border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
  };

  return (
    <button
      {...props}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// Export modalStyles object with CSS classes
export const modalStyles = {
  input: "h-12 w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 focus:border-purple-500 focus:outline-none transition-all duration-200 px-4",
  textarea: "w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 focus:border-purple-500 focus:outline-none transition-all duration-200 p-4 resize-none",
  select: "h-12 w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 focus:border-purple-500 focus:outline-none transition-all duration-200 px-4",
  selectContent: "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg",
  selectItem: "px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 focus:bg-purple-50 dark:focus:bg-purple-900/20 cursor-pointer",
  primaryButton: "px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white",
  cancelButton: "px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300",
  deleteButton: "px-4 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-red-300 dark:border-red-600 hover:border-red-400 dark:hover:border-red-500 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
};
