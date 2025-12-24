import * as React from 'react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'gradient';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50 active:scale-95';

    const variants = {
      default: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl hover:shadow-primary-500/30 dark:shadow-primary-500/20',
      secondary: 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white hover:from-secondary-600 hover:to-secondary-700 shadow-lg hover:shadow-xl hover:shadow-secondary-500/30 dark:shadow-secondary-500/20',
      outline: 'border-2 border-primary-500/50 bg-transparent hover:bg-primary-500/10 dark:hover:bg-primary-500/20 text-primary-600 dark:text-primary-400 backdrop-blur-sm',
      ghost: 'hover:bg-gray-100 dark:hover:bg-dark-200 text-gray-900 dark:text-gray-100',
      glass: 'glass hover:glass-strong text-gray-900 dark:text-white shadow-glass',
      gradient: 'bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 text-white hover:shadow-2xl hover:shadow-primary-500/40 bg-[length:200%_auto] animate-gradient-x',
    };

    const sizes = {
      default: 'h-11 px-6 py-2.5 text-sm',
      sm: 'h-9 px-4 text-xs rounded-lg',
      lg: 'h-12 px-8 text-base rounded-2xl',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
