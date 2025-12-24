import * as React from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  glass?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type, glass = true, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`
          flex h-11 w-full rounded-xl px-4 py-2.5 text-sm
          ${glass
            ? 'input-glass'
            : 'border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-100'
          }
          text-gray-900 dark:text-white
          placeholder:text-gray-500 dark:placeholder:text-gray-400
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:border-primary-500/50
          disabled:cursor-not-allowed disabled:opacity-50
          transition-all duration-200
          file:border-0 file:bg-transparent file:text-sm file:font-medium
          autofill:text-gray-900 autofill:dark:text-white
          ${className}
        `}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
