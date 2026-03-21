import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

/**
 * Reusable Card component with variants
 */
const Card = forwardRef(({
  children,
  variant = 'default', // default, bordered, elevated
  padding = 'md', // none, sm, md, lg
  className = '',
  ...props
}, ref) => {
  // Base styles
  const baseStyles = 'bg-white rounded-xl'

  // Variant styles
  const variantStyles = {
    default: 'shadow-sm border border-gray-100',
    bordered: 'border border-gray-200',
    elevated: 'shadow-lg'
  }

  // Padding styles
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  return (
    <div
      ref={ref}
      className={twMerge(
        baseStyles,
        variantStyles[variant],
        paddingStyles[padding],
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