import { describe, it, expect, beforeEach } from 'vitest'
import { readConfig, writeConfig, updateConfig, getGlobalConfigPath } from './store.js'

describe('config store (browser fallback)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('uses a browser path when not in Tauri', async () => {
    const p = await getGlobalConfigPath()
    expect(p).toBe('config.json')
  })

  it('reads/writes config via localStorage', async () => {
    await writeConfig({ a: 1 })
    const cfg = await readConfig()
    expect(cfg).toHaveProperty('a', 1)
  })

  it('merges updates', async () => {
    await writeConfig({ a: 1 })
    const next = await updateConfig({ b: 2 })
    expect(next).toHaveProperty('a', 1)
    expect(next).toHaveProperty('b', 2)
    const roundtrip = await readConfig()
    expect(roundtrip).toHaveProperty('a', 1)
    expect(roundtrip).toHaveProperty('b', 2)
  })

  describe('privacy settings', () => {
    it('adds default privacy settings on first read', async () => {
      const cfg = await readConfig()
      expect(cfg).toHaveProperty('privacy')
      expect(cfg.privacy).toEqual({
        crashReporting: true,
        anonymizePaths: true,
        anonymizeEmails: true,
        sharePerformanceData: false
      })
    })

    it('applies privacy defaults to existing config without privacy key', async () => {
      // Write config without privacy settings (simulating existing user)
      localStorage.setItem('lokus:config', JSON.stringify({ theme: 'dark', a: 1 }))

      const cfg = await readConfig()
      expect(cfg).toHaveProperty('theme', 'dark')
      expect(cfg).toHaveProperty('a', 1)
      expect(cfg).toHaveProperty('privacy')
      expect(cfg.privacy).toEqual({
        crashReporting: true,
        anonymizePaths: true,
        anonymizeEmails: true,
        sharePerformanceData: false
      })
    })

    it('preserves user privacy preferences', async () => {
      await writeConfig({
        privacy: {
          crashReporting: false,
          anonymizePaths: true,
          anonymizeEmails: true,
          sharePerformanceData: true
        }
      })

      const cfg = await readConfig()
      expect(cfg.privacy.crashReporting).toBe(false)
      expect(cfg.privacy.sharePerformanceData).toBe(true)
    })

    it('validates privacy settings - rejects non-boolean values', async () => {
      await writeConfig({
        privacy: {
          crashReporting: 'yes',  // invalid
          anonymizePaths: 1,      // invalid
          anonymizeEmails: null,  // invalid
          sharePerformanceData: false
        }
      })

      const cfg = await readConfig()
      // Should fall back to defaults for invalid values
      expect(cfg.privacy.crashReporting).toBe(true)  // default
      expect(cfg.privacy.anonymizePaths).toBe(true)  // default
      expect(cfg.privacy.anonymizeEmails).toBe(true) // default
      expect(cfg.privacy.sharePerformanceData).toBe(false) // valid
    })

    it('handles partial privacy settings by applying defaults', async () => {
      await writeConfig({
        privacy: {
          crashReporting: false
          // missing other fields
        }
      })

      const cfg = await readConfig()
      expect(cfg.privacy.crashReporting).toBe(false) // user value
      expect(cfg.privacy.anonymizePaths).toBe(true)  // default
      expect(cfg.privacy.anonymizeEmails).toBe(true) // default
      expect(cfg.privacy.sharePerformanceData).toBe(false) // default
    })

    it('handles null or invalid privacy object', async () => {
      localStorage.setItem('lokus:config', JSON.stringify({ privacy: null }))

      const cfg = await readConfig()
      expect(cfg.privacy).toEqual({
        crashReporting: true,
        anonymizePaths: true,
        anonymizeEmails: true,
        sharePerformanceData: false
      })
    })

    it('updateConfig preserves and validates privacy settings', async () => {
      await writeConfig({ theme: 'light' })

      const next = await updateConfig({
        privacy: { crashReporting: false }
      })

      expect(next.privacy.crashReporting).toBe(false)
      expect(next.privacy.anonymizePaths).toBe(true)  // default
      expect(next.privacy.anonymizeEmails).toBe(true) // default
      expect(next.privacy.sharePerformanceData).toBe(false) // default
    })
  })
})
