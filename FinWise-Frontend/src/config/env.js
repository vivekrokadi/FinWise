/**
 * Environment configuration
 * Centralized access to environment variables
 */

export const ENV = {
  API_URL: import.meta.env.VITE_API_URL,
  APP_NAME: import.meta.env.VITE_APP_NAME || 'FinWise',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
}

// Validate required environment variables
const requiredEnvVars = ['VITE_API_URL']
const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !import.meta.env[envVar]
)

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(
      ', '
    )}. Please check your .env file.`
  )
}

export default ENV