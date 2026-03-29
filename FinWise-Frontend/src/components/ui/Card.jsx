// FinWise-Frontend/src/components/ui/Card.jsx
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

/**
 * Reusable Card component with variants
 * @param {React.ReactNode} children - Card content
 * @param {string} variant - 'default' | 'bordered' | 'elevated' | 'gradient'
 * @param {string} padding - 'none' | 'sm' | 'md' | 'lg'
 * @param {string} className - Additional Tailwind classes
 */
const Card = forwardRef(({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  hover = false,
  ...props
}, ref) => {
  // Base styles
  const baseStyles = 'bg-white rounded-xl overflow-hidden'

  // Variant styles
  const variantStyles = {
    default: 'shadow-sm border border-gray-100',
    bordered: 'border-2 border-gray-200',
    elevated: 'shadow-lg border border-gray-100',
    gradient: 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200'
  }

  // Padding styles
  const paddingStyles = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  }

  // Hover effect
  const hoverStyles = hover ? 'transition-all hover:shadow-md hover:-translate-y-0.5' : 'transition-shadow'

  return (
    <div
      ref={ref}
      className={twMerge(
        baseStyles,
        variantStyles[variant],
        paddingStyles[padding],
        hoverStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'

export default Card