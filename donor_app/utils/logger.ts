// donor_app/utils/logger.ts
// Structured logger with PII redaction for production safety

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  timestamp: string
}

// PII patterns to redact
const PII_PATTERNS = [
  { pattern: /\b\d{10,}\b/g, replacement: '[PHONE]' },           // Phone numbers
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: '[EMAIL]' }, // Emails
  { pattern: /\"phone\"\s*:\s*\"[^\"]*\"/g, replacement: '"phone": "[PHONE]"' },
  { pattern: /\"email\"\s*:\s*\"[^\"]*\"/g, replacement: '"email": "[EMAIL]"' },
  { pattern: /\"name\"\s*:\s*\"[^\"]*\"/g, replacement: '"name": "[NAME]"' },
  { pattern: /\"user_id\"\s*:\s*\"[^\"]*\"/g, replacement: '"user_id": "[UID]"' },
  { pattern: /\"id\"\s*:\s*\"[^\"]*\"/g, replacement: '"id": "[ID]"' },
  { pattern: /latitude|longitude/gi, replacement: '[COORDS]' },
]

function redactPII(obj: unknown): unknown {
  if (typeof obj === 'string') {
    let result = obj
    for (const { pattern, replacement } of PII_PATTERNS) {
      result = result.replace(pattern, replacement)
    }
    return result
  }
  if (Array.isArray(obj)) {
    return obj.map(redactPII)
  }
  if (obj && typeof obj === 'object') {
    const redacted: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      // Skip sensitive keys entirely
      if (['password', 'token', 'secret', 'key', 'authorization'].some(k => key.toLowerCase().includes(k))) {
        redacted[key] = '[REDACTED]'
      } else {
        redacted[key] = redactPII(value)
      }
    }
    return redacted
  }
  return obj
}

function formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`
  const ctx = context ? ` ${JSON.stringify(redactPII(context))}` : ''
  return `${prefix} ${message}${ctx}`
}

function shouldLog(level: LogLevel): boolean {
  const levels: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 }
  const minLevel = (process.env.NODE_ENV === 'production' ? 'warn' : 'debug') as LogLevel
  return levels[level] >= levels[minLevel]
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => {
    if (shouldLog('debug')) console.debug(formatMessage('debug', message, context))
  },
  info: (message: string, context?: Record<string, unknown>) => {
    if (shouldLog('info')) console.info(formatMessage('info', message, context))
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    if (shouldLog('warn')) console.warn(formatMessage('warn', message, context))
  },
  error: (message: string, context?: Record<string, unknown>) => {
    if (shouldLog('error')) console.error(formatMessage('error', message, context))
  },

  // Specialized methods for common patterns
  auth: (action: string, context?: { userId?: string; role?: string; error?: Error }) => {
    logger.info(`Auth: ${action}`, {
      userId: context?.userId ? `[UID:${context.userId.slice(0, 8)}...]` : undefined,
      role: context?.role,
      error: context?.error?.message,
    })
  },

  db: (operation: string, context?: { table?: string; error?: Error; durationMs?: number }) => {
    logger.debug(`DB: ${operation}`, {
      table: context?.table,
      error: context?.error?.message,
      durationMs: context?.durationMs,
    })
  },

  realtime: (event: string, context?: { table?: string; eventType?: string }) => {
    logger.debug(`Realtime: ${event}`, {
      table: context?.table,
      eventType: context?.eventType,
    })
  },

  push: (action: string, context?: { userId?: string; error?: Error }) => {
    logger.info(`Push: ${action}`, {
      userId: context?.userId ? `[UID:${context.userId.slice(0, 8)}...]` : undefined,
      error: context?.error?.message,
    })
  },

  matching: (action: string, context?: { bloodGroup?: string; donorCount?: number; requestId?: string }) => {
    logger.info(`Matching: ${action}`, {
      bloodGroup: context?.bloodGroup,
      donorCount: context?.donorCount,
      requestId: context?.requestId ? `[REQ:${context.requestId.slice(0, 8)}...]` : undefined,
    })
  },
}

// Development-only logger (no redaction, verbose)
export const devLogger = {
  debug: (message: string, context?: Record<string, unknown>) => console.debug(`[DEV] ${message}`, context),
  info: (message: string, context?: Record<string, unknown>) => console.info(`[DEV] ${message}`, context),
  warn: (message: string, context?: Record<string, unknown>) => console.warn(`[DEV] ${message}`, context),
  error: (message: string, context?: Record<string, unknown>) => console.error(`[DEV] ${message}`, context),
}