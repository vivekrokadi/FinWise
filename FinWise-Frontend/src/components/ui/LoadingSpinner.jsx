import { twMerge } from 'tailwind-merge'

/**
 * Loading spinner component with different sizes
 */
const LoadingSpinner = ({ 
  size = 'md', 
  className = '',
  fullPage = false,
  text = 'Loading...'
}) => {
  // Size mappings
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const spinner = (
    <div className={twMerge('flex flex-col items-center justify-center', className)}>
      <div className={twMerge(
        'animate-spin rounded-full border-4 border-gray-200 border-t-blue-600',
        sizes[size]
      )} />
      {text && <p className="mt-2 text-gray-600 text-sm">{text}</p>}
    </div>
  )

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

export default LoadingSpinner