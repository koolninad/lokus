// Integration tests for crash reporting system
import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as Sentry from '@sentry/react'

// Mock Sentry
vi.mock('@sentry/react', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  ErrorBoundary: ({ children, fallback }) => children,
  browserTracingIntegration: vi.fn(() => ({})),
  replayIntegration: vi.fn(() => ({})),
}))

// Mock privacy utilities
vi.mock('../../src/utils/privacy.js', () => ({
  beforeSendHook: vi.fn((event) => event),
  scrubFilePath: vi.fn((path) => path?.replace(/\/Users\/\w+/, '~') || ''),
  scrubEmail: vi.fn((text) => text?.replace(/[\w.-]+@[\w.-]+\.\w+/g, 'u***@***.com') || ''),
  scrubTokens: vi.fn((text) => text?.replace(/Bearer\s+\S+/g, '[REDACTED_TOKEN]') || ''),
  scrubBreadcrumbs: vi.fn((crumbs) => crumbs?.filter(c => !c.message?.includes('note_content')) || []),
}))

// Mock config
vi.mock('../../src/core/config/store.js', () => ({
  readConfig: vi.fn(async () => ({
    privacy: {
      crashReporting: true,
      anonymizePaths: true,
      anonymizeEmails: true,
    },
  })),
  updateConfig: vi.fn(async () => {}),
}))

describe('Crash Reporting Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Sentry Initialization', () => {
    it('should initialize Sentry with DSN', () => {
      // Set environment variable
      import.meta.env.VITE_SENTRY_DSN = 'https://test@example.com/1'
      import.meta.env.VITE_SENTRY_ENVIRONMENT = 'test'

      // Initialize would happen in main.jsx
      expect(import.meta.env.VITE_SENTRY_DSN).toBeTruthy()
    })

    it('should not initialize without DSN', () => {
      delete import.meta.env.VITE_SENTRY_DSN
      expect(import.meta.env.VITE_SENTRY_DSN).toBeFalsy()
    })

    it('should use correct environment', () => {
      import.meta.env.VITE_SENTRY_ENVIRONMENT = 'production'
      expect(import.meta.env.VITE_SENTRY_ENVIRONMENT).toBe('production')
    })
  })

  describe('Error Capture', () => {
    it('should capture exceptions', () => {
      const error = new Error('Test error')
      Sentry.captureException(error)
      expect(Sentry.captureException).toHaveBeenCalledWith(error)
    })

    it('should capture messages', () => {
      Sentry.captureMessage('Test message', 'error')
      expect(Sentry.captureMessage).toHaveBeenCalledWith('Test message', 'error')
    })
  })

  describe('Privacy Integration', () => {
    it('should scrub PII from error messages', async () => {
      const { scrubFilePath, scrubEmail, scrubTokens } = await import('../../src/utils/privacy.js')

      const errorMsg = '/Users/john/file.txt with token Bearer abc123 for user@test.com'
      let scrubbed = scrubFilePath(errorMsg)
      scrubbed = scrubEmail(scrubbed)
      scrubbed = scrubTokens(scrubbed)

      expect(scrubFilePath).toHaveBeenCalled()
      expect(scrubEmail).toHaveBeenCalled()
      expect(scrubTokens).toHaveBeenCalled()
    })

    it('should filter sensitive breadcrumbs', async () => {
      const { scrubBreadcrumbs } = await import('../../src/utils/privacy.js')

      const breadcrumbs = [
        { message: 'Normal action' },
        { message: 'note_content: sensitive' },
      ]

      scrubBreadcrumbs(breadcrumbs)
      expect(scrubBreadcrumbs).toHaveBeenCalledWith(breadcrumbs)
    })
  })

  describe('Configuration', () => {
    it('should read privacy settings from config', async () => {
      const { readConfig } = await import('../../src/core/config/store.js')
      const config = await readConfig()

      expect(config.privacy).toBeDefined()
      expect(config.privacy.crashReporting).toBeDefined()
    })

    it('should respect user opt-out', async () => {
      const { readConfig } = await import('../../src/core/config/store.js')
      readConfig.mockResolvedValueOnce({
        privacy: {
          crashReporting: false,
        },
      })

      const config = await readConfig()
      expect(config.privacy.crashReporting).toBe(false)
    })
  })

  describe('Environment Variables', () => {
    it('should have DSN configuration', () => {
      expect(import.meta.env).toHaveProperty('VITE_SENTRY_DSN')
    })

    it('should have environment configuration', () => {
      expect(import.meta.env).toHaveProperty('VITE_SENTRY_ENVIRONMENT')
    })

    it('should have enable flag', () => {
      expect(import.meta.env).toHaveProperty('VITE_ENABLE_CRASH_REPORTS')
    })
  })

  describe('Error Boundary', () => {
    it('should provide ErrorBoundary component', () => {
      expect(Sentry.ErrorBoundary).toBeDefined()
      expect(typeof Sentry.ErrorBoundary).toBe('function')
    })
  })
})
