// hospital_web/src/lib/logger.js
// Structured logger with PII redaction for production safety

const PII_PATTERNS = [
  { pattern: /\b\d{10,}\b/g, replacement: '[PHONE]' },
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: '[EMAIL]' },
  { pattern: /"phone"\s*:\s*"[^"]*"/g, replacement: '"phone": "[PHONE]"' },
  { pattern: /"email"\s*:\s*"[^"]*"/g, replacement: '"email": "[EMAIL]"' },
  { pattern: /"name"\s*:\s*"[^"]*"/g, replacement: '"name": "[NAME]"' },
  { pattern: /"user_id"\s*:\s*"[^"]*"/g, replacement: '"user_id": "[UID]"' },
  { pattern: /"id"\s*:\s*"[^"]*"/g, replacement: '"id": "[ID]"' },
  { pattern: /latitude|longitude/gi, replacement: '[COORDS]' },
]

function redactPII(obj) {
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
    const redacted = {}
    for (const [key, value] of Object.entries(obj)) {
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

function formatMessage(level, message, context) {
  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`
  const ctx = context ? ` ${JSON.stringify(redactPII(context))}` : ''
  return `${prefix} ${message}${ctx}`
}

function shouldLog(level) {
  const levels = { debug: 0, info: 1, warn: 2, error: 3 }
  const minLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
  return levels[level] >= levels[minLevel]
}

export const logger = {
  debug: (message, context) => {
    if (shouldLog('debug')) console.debug(formatMessage('debug', message, context))
  },
  info: (message, context) => {
    if (shouldLog('info')) console.info(formatMessage('info', message, context))
  },
  warn: (message, context) => {
    if (shouldLog('warn')) console.warn(formatMessage('warn', message, context))
  },
  error: (message, context) => {
    if (shouldLog('error')) console.error(formatMessage('error', message, context))
  },

  // Specialized methods for common patterns
  auth: (action, context = {}) => {
    logger.info(`Auth: ${action}`, {
      userId: context.userId ? `[UID:${context.userId.slice(0, 8)}...]` : undefined,
      role: context.role,
      error: context.error?.message,
    })
  },

  db: (operation, context = {}) => {
    logger.debug(`DB: ${operation}`, {
      table: context.table,
      error: context.error?.message,
      durationMs: context.durationMs,
    })
  },

  realtime: (event, context = {}) => {
    logger.debug(`Realtime: ${event}`, {
      table: context.table,
      eventType: context.eventType,
    })
  },

  push: (action, context = {}) => {
    logger.info(`Push: ${action}`, {
      userId: context.userId ? `[UID:${context.userId.slice(0, 8)}...]` : undefined,
      error: context.error?.message,
    })
  },

  matching: (action, context = {}) => {
    logger.info(`Matching: ${action}`, {
      bloodGroup: context.bloodGroup,
      donorCount: context.donorCount,
      requestId: context.requestId ? `[REQ:${context.requestId.slice(0, 8)}...]` : undefined,
    })
  },
}

// Development-only logger (no redaction, verbose)
export const devLogger = {
  debug: (message, context) => console.debug(`[DEV] ${message}`, context),
  info: (message, context) => console.info(`[DEV] ${message}`, context),
  warn: (message, context) => console.warn(`[DEV] ${message}`, context),
  error: (message, context) => console.error(`[DEV] ${message}`, context),
}