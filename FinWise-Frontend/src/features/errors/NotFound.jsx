import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, SearchX } from 'lucide-react'
import Button from '../../components/ui/Button'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Illustration */}
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
            <SearchX className="h-16 w-16 text-blue-300" />
          </div>
          <div className="absolute top-0 right-1/4 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
            <span className="text-yellow-500 font-bold text-xs">!</span>
          </div>
        </div>

        {/* Text */}
        <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Page not found</h2>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            onClick={() => navigate('/dashboard')}
            leftIcon={<Home className="h-4 w-4" />}
          >
            Go to Dashboard
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Go Back
          </Button>
        </div>

        {/* Helpful links */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400 mb-3">Looking for something specific?</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'Transactions', path: '/transactions' },
              { label: 'Accounts',     path: '/accounts' },
              { label: 'Budgets',      path: '/budgets' },
              { label: 'AI Insights',  path: '/ai/insights' },
              { label: 'Profile',      path: '/profile' }
            ].map(({ label, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound