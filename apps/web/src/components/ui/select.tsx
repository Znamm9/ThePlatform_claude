import * as React from 'react';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  glass?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', glass = true, children, ...props }, ref) => {
    return (
      <select
        className={`
          flex h-11 w-full rounded-xl px-4 py-2.5 text-sm
          ${
            glass
              ? 'input-glass'
              : 'border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-100'
          }
          text-gray-900 dark:text-white
          [&>option]:text-gray-900 [&>option]:dark:text-white
          [&>option]:bg-white [&>option]:dark:bg-dark-100
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:border-primary-500/50
          disabled:cursor-not-allowed disabled:opacity-50
          transition-all duration-200
          ${className}
        `}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

export { Select };
