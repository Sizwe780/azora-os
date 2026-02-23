/**
 * Environment Configuration Module
 * 
 * Provides type-safe environment variable access with Zod validation.
 * Validates all required environment variables at startup with clear error messages.
 * 
 * Requirements: 4.3, 5.2, 6.1, 6.2, 6.4
 */

import { z } from 'zod'

/**
 * Environment validation schema
 * Defines all environment variables with their types and validation rules
 */
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Application Configuration
  BUILDSPACES_PORT: z.string().default('3002'),
  BUILDSPACES_ENV: z.string().default('development'),
  BUILDSPACES_DEBUG: z.string().transform(val => val === 'true').default('false'),
  BUILDSPACES_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Authentication (Required)
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required for authentication'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL').default('http://localhost:3002'),
  NEXTAUTH_URL_INTERNAL: z.string().url().optional(),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required for token signing'),

  // Database (Required)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required. Set to your PostgreSQL connection string.'),
  DATABASE_POOL_SIZE: z.string().transform(val => parseInt(val, 10)).default('20'),

  // Redis (Optional)
  REDIS_URL: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
  USE_REDIS: z.string().transform(val => val === 'true').default('false'),

  // LLM Providers (At least one required for AI features)
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_ORG_ID: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  LOCAL_LLM_MODEL: z.string().optional(),
  LOCAL_LLM_API_URL: z.string().url().optional(),

  // GitHub Integration (Optional)
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_APP_ID: z.string().optional(),
  GITHUB_APP_PRIVATE_KEY: z.string().optional(),
  GITHUB_WEBHOOK_SECRET: z.string().optional(),

  // Figma Integration (Optional)
  FIGMA_API_TOKEN: z.string().optional(),
  FIGMA_TOKEN: z.string().optional(),

  // Stripe Payment (Optional)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Web3 / Blockchain (Optional)
  ETHEREUM_RPC_URL: z.string().url().optional(),
  SOLANA_RPC_URL: z.string().url().optional(),
  AZR_MINT_ENABLED: z.string().transform(val => val === 'true').default('false'),
  AZR_TOTAL_SUPPLY: z.string().transform(val => parseInt(val, 10)).optional(),
  AZR_CHAIN: z.string().optional(),
  AZR_CONTRACT_ADDRESS: z.string().optional(),

  // Feature Flags
  SANDBOX_ENABLED: z.string().transform(val => val === 'true').default('true'),
  USE_POSTGRES: z.string().transform(val => val === 'true').default('true'),
  ENABLE_WEBSOCKET_COLLABORATION: z.string().transform(val => val === 'true').default('true'),
  ENABLE_CONSTITUTIONAL_GATES: z.string().transform(val => val === 'true').default('true'),
  ENABLE_AGENT_EXECUTION: z.string().transform(val => val === 'true').default('true'),

  // Terminal Service
  NEXT_PUBLIC_TERMINAL_ENABLED: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_TERMINAL_HOST: z.string().optional(),

  // AI Agent Configuration
  NEXT_PUBLIC_AGENT_API_URL: z.string().default('/api/agents/invoke'),
  NEXT_PUBLIC_EXTERNAL_LLM_ENABLED: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_EXTERNAL_LLM_PROVIDER: z.enum(['openai', 'anthropic', 'local']).default('openai'),
  NEXT_PUBLIC_NOTEBOOK_ENABLED: z.string().transform(val => val === 'true').default('false'),
  NOTEBOOK_EXECUTOR_URL: z.string().optional(),

  // Figma Feature Flag
  NEXT_PUBLIC_FIGMA_ENABLED: z.string().transform(val => val === 'true').default('false'),

  // PredAI Integration
  NEXT_PUBLIC_PREDAI_API_URL: z.string().url().default('http://localhost:3015'),

  // Room Feature Toggles
  ENABLE_CODE_CHAMBER: z.string().transform(val => val === 'true').default('true'),
  ENABLE_SPEC_CHAMBER: z.string().transform(val => val === 'true').default('true'),
  ENABLE_DESIGN_STUDIO: z.string().transform(val => val === 'true').default('true'),
  ENABLE_AI_STUDIO: z.string().transform(val => val === 'true').default('true'),
  ENABLE_COMMAND_DESK: z.string().transform(val => val === 'true').default('true'),
  ENABLE_MAKER_LAB: z.string().transform(val => val === 'true').default('true'),
  ENABLE_COLLABORATION_POD: z.string().transform(val => val === 'true').default('true'),
  ENABLE_COLLECTIBLE_SHOWCASE: z.string().transform(val => val === 'true').default('true'),

  // Agent Configuration
  AGENT_TIMEOUT_MS: z.string().transform(val => parseInt(val, 10)).default('60000'),
  AGENT_MAX_RETRIES: z.string().transform(val => parseInt(val, 10)).default('3'),
  AGENT_COST_THRESHOLD_CENTS: z.string().transform(val => parseInt(val, 10)).default('500'),
  TRACK_AGENT_METRICS: z.string().transform(val => val === 'true').default('true'),

  // Monitoring & Observability
  PROMETHEUS_ENABLED: z.string().transform(val => val === 'true').default('false'),
  PROMETHEUS_PORT: z.string().default('9090'),
  METRICS_SCRAPE_INTERVAL: z.string().default('15s'),
  LOG_FORMAT: z.enum(['json', 'text']).default('json'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  LOG_SERVICE_NAME: z.string().default('buildspaces'),
  SENTRY_DSN: z.string().optional(),
  OTEL_ENABLED: z.string().transform(val => val === 'true').default('false'),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),

  // Development Settings
  NEXT_PUBLIC_DEBUG: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_MOCKING: z.string().transform(val => val === 'true').default('false'),
  TURBO_SKIP_PRUNE: z.string().transform(val => val === 'true').optional(),

  // API Gateway
  API_GATEWAY_URL: z.string().url().default('http://localhost:3000/api'),
  INTERNAL_API_URL: z.string().url().default('http://localhost:3000'),

  // Security & Compliance
  VAULT_ADDR: z.string().url().optional(),
  VAULT_TOKEN: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.string().transform(val => parseInt(val, 10)).default('60000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(val => parseInt(val, 10)).default('1000'),
  CORS_ORIGIN: z.string().default('http://localhost:3002,http://localhost:3000'),
})

/**
 * Parsed and validated environment variables
 * This is the single source of truth for all environment configuration
 */
let env: z.infer<typeof envSchema>

/**
 * Validation errors encountered during environment parsing
 */
let validationErrors: z.ZodError | null = null

/**
 * Initialize and validate environment variables
 * Called automatically on module load
 */
function initializeEnv() {
  try {
    env = envSchema.parse(process.env)
    validationErrors = null
    
    // Log successful initialization in development
    if (env.NODE_ENV === 'development') {
      console.log('[ENV] ✓ Environment variables validated successfully')
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      validationErrors = error
      
      // Log detailed error messages
      console.error('[ENV] ✗ Environment validation failed:')
      console.error('[ENV]')
      
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        console.error(`[ENV]   • ${path}: ${err.message}`)
      })
      
      console.error('[ENV]')
      console.error('[ENV] To fix these errors:')
      console.error('[ENV]   1. Copy .env.example to .env.local')
      console.error('[ENV]   2. Set the required environment variables')
      console.error('[ENV]   3. Restart the development server')
      console.error('[ENV]')
      
      // In production, throw the error to prevent startup
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Environment validation failed. Cannot start application.')
      }
      
      // In development, create a proxy that throws helpful errors
      env = createEnvProxy()
    } else {
      throw error
    }
  }
}

/**
 * Creates a proxy that throws helpful errors when accessing invalid env vars
 * Used in development when validation fails
 */
function createEnvProxy(): any {
  // Get the schema shape to access defaults
  const schemaShape = envSchema.shape as Record<string, any>
  
  return new Proxy({} as any, {
    get: (_target, prop) => {
      const propName = String(prop)
      
      // Check if this property has a default value in the schema
      const fieldSchema = schemaShape[propName]
      if (fieldSchema) {
        try {
          // Try to get the default value
          const result = fieldSchema.safeParse(undefined)
          if (result.success) {
            return result.data
          }
        } catch {
          // No default available
        }
      }
      
      // Find the specific error for this property
      const error = validationErrors?.errors.find(err => 
        err.path.join('.') === propName
      )
      
      if (error) {
        throw new Error(
          `Environment variable ${propName} is invalid: ${error.message}\n` +
          'Please check your .env.local file and ensure all required variables are set correctly.'
        )
      }
      
      throw new Error(
        `Environment variable ${propName} is not configured.\n` +
        'Please check your .env.local file.'
      )
    },
  })
}

// Initialize environment on module load
initializeEnv()

/**
 * Type-safe environment configuration object
 * Use this throughout the application instead of process.env
 * 
 * @example
 * import { env } from '@/lib/config/env'
 * 
 * const dbUrl = env.DATABASE_URL
 * const isDebug = env.BUILDSPACES_DEBUG
 */
export { env }

/**
 * Check if environment is properly configured
 * @returns true if all required variables are valid
 */
export function isEnvValid(): boolean {
  return validationErrors === null
}

/**
 * Get validation errors if any
 * @returns ZodError with details about invalid variables, or null if valid
 */
export function getEnvErrors(): z.ZodError | null {
  return validationErrors
}

/**
 * Get a formatted error message for display
 * @returns Human-readable error message or null if valid
 */
export function getEnvErrorMessage(): string | null {
  if (!validationErrors) return null
  
  const errors = validationErrors.errors.map(err => {
    const path = err.path.join('.')
    return `  • ${path}: ${err.message}`
  }).join('\n')
  
  return `Environment validation failed:\n${errors}\n\nPlease check your .env.local file.`
}

/**
 * Utility to check if a specific feature is enabled
 * Useful for conditional feature rendering
 */
export const features = {
  redis: () => env.USE_REDIS && Boolean(env.REDIS_URL),
  postgres: () => env.USE_POSTGRES && Boolean(env.DATABASE_URL),
  websocketCollaboration: () => env.ENABLE_WEBSOCKET_COLLABORATION,
  constitutionalGates: () => env.ENABLE_CONSTITUTIONAL_GATES,
  agentExecution: () => env.ENABLE_AGENT_EXECUTION,
  terminal: () => env.NEXT_PUBLIC_TERMINAL_ENABLED,
  notebook: () => env.NEXT_PUBLIC_NOTEBOOK_ENABLED,
  figma: () => env.NEXT_PUBLIC_FIGMA_ENABLED,
  stripe: () => Boolean(env.STRIPE_SECRET_KEY),
  github: () => Boolean(env.GITHUB_TOKEN),
  openai: () => Boolean(env.OPENAI_API_KEY),
  anthropic: () => Boolean(env.ANTHROPIC_API_KEY),
  localLLM: () => Boolean(env.LOCAL_LLM_API_URL),
  azrMinting: () => env.AZR_MINT_ENABLED,
  prometheus: () => env.PROMETHEUS_ENABLED,
  sentry: () => Boolean(env.SENTRY_DSN),
  otel: () => env.OTEL_ENABLED,
} as const

/**
 * Utility to check which rooms are enabled
 */
export const rooms = {
  codeChamber: () => env.ENABLE_CODE_CHAMBER,
  specChamber: () => env.ENABLE_SPEC_CHAMBER,
  designStudio: () => env.ENABLE_DESIGN_STUDIO,
  aiStudio: () => env.ENABLE_AI_STUDIO,
  commandDesk: () => env.ENABLE_COMMAND_DESK,
  makerLab: () => env.ENABLE_MAKER_LAB,
  collaborationPod: () => env.ENABLE_COLLABORATION_POD,
  collectibleShowcase: () => env.ENABLE_COLLECTIBLE_SHOWCASE,
} as const
