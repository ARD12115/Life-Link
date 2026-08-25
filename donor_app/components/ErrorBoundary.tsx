// donor_app/components/ErrorBoundary.tsx
// React Error Boundary for graceful error handling in Expo/React Native

import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react-native'
import { Theme } from '../theme'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    // Log to our structured logger
    import('../utils/logger').then(({ logger }) => {
      logger.error('React Error Boundary caught error', {
        error: error?.message,
        stack: error?.stack,
        componentStack: errorInfo?.componentStack
      })
    }).catch(() => {
      // Fallback if logger fails
      console.error('ErrorBoundary caught:', error, errorInfo)
    })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleHome = () => {
    // Navigate to root - in Expo Router this would be router.replace('/')
    // For now, just reset the error state
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <AlertTriangle size={48} color={Theme.colors.primary} />
          </View>

          <Text style={styles.title}>Something went wrong</Text>

          <Text style={styles.message}>
            We encountered an unexpected error. Your data is safe — this is just a display issue.
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={this.handleRetry}
              activeOpacity={0.8}
            >
              <RefreshCw size={20} color="white" />
              <Text style={styles.primaryButtonText}> Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={this.handleHome}
              activeOpacity={0.8}
            >
              <Home size={20} color={Theme.colors.primary} />
              <Text style={styles.secondaryButtonText}> Go Home</Text>
            </TouchableOpacity>
          </View>

          {__DEV__ && this.state.error && (
            <View style={styles.devDetails}>
              <Text style={styles.devTitle}>Error Details (Development)</Text>
              <Text style={styles.devText}>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack && `\n\n${this.state.errorInfo.componentStack}`}
              </Text>
            </View>
          )}
        </View>
      )
    }

    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${Theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  message: {
    color: Theme.colors.textMuted,
    marginBottom: Theme.spacing.xl,
    maxWidth: '90%',
    lineHeight: 24,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: Theme.spacing.xl,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    backgroundColor: Theme.colors.primary,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: Theme.colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  devDetails: {
    width: '100%',
    maxWidth: 500,
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  devTitle: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Theme.spacing.md,
  },
  devText: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontFamily: 'monospace',
  },
})

export default ErrorBoundary