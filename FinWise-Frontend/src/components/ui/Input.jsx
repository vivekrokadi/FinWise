import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

/**
 * Reusable Input component with error state
 */
const Input = forwardRef(({
  label,
  type = 'text',
  error,
  className = '',
  inputClassName = '',
  required = false,
  disabled = false,
  placeholder,
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  return (
    <div className={twMerge('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          className={twMerge(
            'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300',
            disabled && 'bg-gray-100 cursor-not-allowed',
            inputClassName
          )}
          disabled={disabled}
          placeholder={placeholder}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input