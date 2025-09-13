import { describe, it, expect, beforeEach } from 'vitest'
import { 
  ManifestValidator, 
  validateManifest, 
  createManifestTemplate,
  PLUGIN_MANIFEST_SCHEMA,
  VALID_PERMISSIONS,
  VALID_ACTIVATION_EVENTS,
  VALID_CATEGORIES
} from '../../../src/plugins/core/PluginManifest.js'

describe('PluginManifest', () => {
  let validator

  beforeEach(() => {
    validator = new ManifestValidator()
  })

  describe('Schema Constants', () => {
    it('should have required fields defined', () => {
      expect(PLUGIN_MANIFEST_SCHEMA.required).toEqual([
        'id',
        'name', 
        'version',
        'main',
        'lokusVersion'
      ])
    })

    it('should have valid permissions defined', () => {
      expect(VALID_PERMISSIONS).toContain('read_files')
      expect(VALID_PERMISSIONS).toContain('write_files')
      expect(VALID_PERMISSIONS).toContain('all')
    })

    it('should have valid activation events defined', () => {
      expect(VALID_ACTIVATION_EVENTS).toContain('onStartup')
      expect(VALID_ACTIVATION_EVENTS).toContain('onCommand:*')
    })

    it('should have valid categories defined', () => {
      expect(VALID_CATEGORIES).toContain('Editor')
      expect(VALID_CATEGORIES).toContain('Theme')
      expect(VALID_CATEGORIES).toContain('Other')
    })
  })

  describe('ManifestValidator - Basic Validation', () => {
    it('should reject null manifest', () => {
      const result = validator.validate(null)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Manifest must be a valid JSON object')
    })

    it('should reject non-object manifest', () => {
      const result = validator.validate('not an object')
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Manifest must be a valid JSON object')
    })

    it('should validate minimal valid manifest', () => {
      const manifest = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        main: 'index.js',
        lokusVersion: '^1.0.0'
      }
      
      const result = validator.validate(manifest)
      
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('Required Fields Validation', () => {
    it('should detect missing required fields', () => {
      const manifest = {
        id: 'test-plugin',
        name: 'Test Plugin'
        // Missing: version, main, lokusVersion
      }
      
      const result = validator.validate(manifest)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Missing required field: version')
      expect(result.errors).toContain('Missing required field: main')
      expect(result.errors).toContain('Missing required field: lokusVersion')
    })

    it('should detect null required fields', () => {
      const manifest = {
        id: null,
        name: 'Test Plugin',
        version: '1.0.0',
        main: 'index.js',
        lokusVersion: '^1.0.0'
      }
      
      const result = validator.validate(manifest)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Missing required field: id')
    })

    it('should detect undefined required fields', () => {
      const manifest = {
        id: 'test-plugin',
        name: undefined,
        version: '1.0.0',
        main: 'index.js',
        lokusVersion: '^1.0.0'
      }
      
      const result = validator.validate(manifest)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Missing required field: name')
    })
  })

  describe('Field Type Validation', () => {
    it('should validate correct field types', () => {
      const manifest = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        main: 'index.js',
        lokusVersion: '^1.0.0',
        description: 'A test plugin',
        keywords: ['test', 'example'],
        permissions: ['read_files'],
        dependencies: { 'other-plugin': '^1.0.0' }
      }
      
      const result = validator.validate(manifest)
      
      expect(result.valid).toBe(true)
    })

    it('should detect incorrect field types', () => {
      const manifest = {
        id: 'test-plugin',
        name: 123, // Should be string
        version: '1.0.0',
        main: 'index.js',
        lokusVersion: '^1.0.0',
        keywords: 'not-array', // Should be array
        permissions: 'not-array' // Should be array
      }
      
      const result = validator.validate(manifest)
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('name') && e.includes('invalid type'))).toBe(true)
      expect(result.errors.some(e => e.includes('keywords') && e.includes('invalid type'))).toBe(true)
      expect(result.errors.some(e => e.includes('permissions') && e.includes('invalid type'))).toBe(true)
    })

    it('should handle multiple valid types', () => {
      const manifest1 = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        main: 'index.js',
        lokusVersion: '^1.0.0',
        author: 'John Doe' // String format
      }

      const manifest2 = {
        id: 'test-plugin',
        name: 'Test Plugin', 
        version: '1.0.0',
        main: 'index.js',
        lokusVersion: '^1.0.0',
        author: { // Object format
          name: 'John Doe',
          email: 'john@example.com'
        }
      }
      
      expect(validator.validate(manifest1).valid).toBe(true)
      expect(validator.validate(manifest2).valid).toBe(true)
    })
  })

  describe('Field Format Validation', () => {
    it('should validate plugin ID format', () => {
      const validIds = ['my-plugin', 'plugin123', 'a-very-long-plugin-name']
      const invalidIds = ['My-Plugin', '123plugin', 'plugin_name', 'plugin.name', '-plugin', 'plugin-']

      for (const id of validIds) {
        const manifest = createValidManifest({ id })
        const result = validator.validate(manifest)
        expect(result.valid).toBe(true)
      }

      for (const id of invalidIds) {
        const manifest = createValidManifest({ id })
        const result = validator.validate(manifest)
        expect(result.valid).toBe(false)
        expect(result.errors.some(e => e.includes('Plugin ID must be lowercase'))).toBe(true)
      }
    })

    it('should validate version format (semantic versioning)', () => {
      const validVersions = ['1.0.0', '1.2.3', '1.0.0-alpha', '1.0.0+build.1']
      const invalidVersions = ['1.0', '1', 'v1.0.0', '1.0.0.0', 'latest']

      for (const version of validVersions) {
        const manifest = createValidManifest({ version })
        const result = validator.validate(manifest)
        expect(result.valid).toBe(true)
      }

      for (const version of invalidVersions) {
        const manifest = createValidManifest({ version })
        const result = validator.validate(manifest)
        expect(result.valid).toBe(false)
        expect(result.errors.some(e => e.includes('Version must follow semantic versioning'))).toBe(true)
      }
    })

    it('should validate lokusVersion format', () => {
      const validVersions = ['^1.0.0', '>=1.0.0', '~1.0.0', '1.0.0', '>1.0.0', '<2.0.0']
      const invalidVersions = ['invalid', 'v1.0.0', '']

      for (const lokusVersion of validVersions) {
        const manifest = createValidManifest({ lokusVersion })
        const result = validator.validate(manifest)
        expect(result.valid).toBe(true)
      }

      for (const lokusVersion of invalidVersions) {
        const manifest = createValidManifest({ lokusVersion })
        const result = validator.validate(manifest)
        expect(result.valid).toBe(false)
        expect(result.errors.some(e => e.includes('lokusVersion must be a valid version range'))).toBe(true)
      }
    })

    it('should validate main file extension', () => {
      const validFiles = ['index.js', 'main.mjs', 'plugin.ts']
      const invalidFiles = ['index.txt', 'main.py', 'plugin']

      for (const main of validFiles) {
        const manifest = createValidManifest({ main })
        const result = validator.validate(manifest)
        expect(result.valid).toBe(true)
      }

      for (const main of invalidFiles) {
        const manifest = createValidManifest({ main })
        const result = validator.validate(manifest)
        expect(result.valid).toBe(false)
        expect(result.errors.some(e => e.includes('Main file must have .js, .mjs, or .ts extension'))).toBe(true)
      }
    })

    it('should validate homepage URL', () => {
      const validUrls = ['https://example.com', 'http://localhost:3000', 'https://github.com/user/repo']
      const invalidUrls = ['not-a-url', 'ftp://example.com', 'example.com']

      for (const homepage of validUrls) {
        const manifest = createValidManifest({ homepage })
        const result = validator.validate(manifest)
        expect(result.valid).toBe(true)
      }

      for (const homepage of invalidUrls) {
        const manifest = createValidManifest({ homepage })
        const result = validator.validate(manifest)
        expect(result.valid).toBe(false)
        expect(result.errors.some(e => e.includes('Homepage must be a valid URL'))).toBe(true)
      }
    })

    it('should validate author object format', () => {
      const validAuthor = {
        name: 'John Doe',
        email: 'john@example.com',
        url: 'https://johndoe.com'
      }

      const invalidAuthor1 = {
        email: 'john@example.com' // Missing name
      }

      const invalidAuthor2 = {
        name: 'John Doe',
        email: 'invalid-email' // Invalid email
      }

      const invalidAuthor3 = {
        name: 'John Doe',
        url: 'not-a-url' // Invalid URL
      }

      const result1 = validator.validate(createValidManifest({ author: validAuthor }))
      expect(result1.valid).toBe(true)

      const result2 = validator.validate(createValidManifest({ author: invalidAuthor1 }))
      expect(result2.valid).toBe(false)
      expect(result2.errors.some(e => e.includes('Author object must have a name field'))).toBe(true)

      const result3 = validator.validate(createValidManifest({ author: invalidAuthor2 }))
      expect(result3.valid).toBe(false)
      expect(result3.errors.some(e => e.includes('Author email must be a valid email address'))).toBe(true)

      const result4 = validator.validate(createValidManifest({ author: invalidAuthor3 }))
      expect(result4.valid).toBe(false)
      expect(result4.errors.some(e => e.includes('Author URL must be a valid URL'))).toBe(true)
    })
  })

  describe('Dependencies Validation', () => {
    it('should validate correct dependencies format', () => {
      const manifest = createValidManifest({
        dependencies: {
          'plugin-a': '^1.0.0',
          'plugin-b': '>=2.0.0'
        }
      })
      
      const result = validator.validate(manifest)
      expect(result.valid).toBe(true)
    })

    it('should reject non-object dependencies', () => {
      const manifest = createValidManifest({
        dependencies: 'invalid'
      })
      
      const result = validator.validate(manifest)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Dependencies must be an object')
    })

    it('should validate dependency IDs and versions', () => {
      const manifest = createValidManifest({
        dependencies: {
          '': '^1.0.0', // Empty ID
          'valid-plugin': '', // Empty version
          123: '^1.0.0' // Non-string ID
        }
      })
      
      const result = validator.validate(manifest)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('Invalid dependency ID'))).toBe(true)
      expect(result.errors.some(e => e.includes('Invalid dependency version'))).toBe(true)
    })

    it('should detect circular dependencies', () => {
      const manifest = createValidManifest({
        id: 'self-dependent',
        dependencies: {
          'self-dependent': '^1.0.0'
        }
      })
      
      const result = validator.validate(manifest)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Plugin cannot depend on itself')
    })
  })

  describe('Permissions Validation', () => {
    it('should validate correct permissions', () => {
      const manifest = createValidManifest({
        permissions: ['read_files', 'write_files', 'access_network']
      })
      
      const result = validator.validate(manifest)
      expect(result.valid).toBe(true)
    })

    it('should reject non-array permissions', () => {
      const manifest = createValidManifest({
        permissions: 'invalid'
      })
      
      const result = validator.validate(manifest)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Permissions must be an array')
    })

    it('should reject non-string permissions', () => {
      const manifest = createValidManifest({
        permissions: ['read_files', 123, null]
      })
      
      const result = validator.validate(manifest)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Each permission must be a string')
    })

    it('should warn about unknown permissions', () => {
      const manifest = createValidManifest({
        permissions: ['read_files', 'unknown_permission']
      })
      
      const result = validator.validate(manifest)
      expect(result.valid).toBe(true)
      expect(result.warnings.some(w => w.includes('Unknown permission: unknown_permission'))).toBe(true)
    })

    it('should warn about dangerous permissions', () => {
      const manifest = createValidManifest({
        permissions: ['all', 'execute_commands']
      })
      
      const result = validator.validate(manifest)
      expect(result.valid).toBe(true)
      expect(result.warnings.some(w => w.includes('Potentially dangerous permission: all'))).toBe(true)
      expect(result.warnings.some(w => w.includes('Potentially dangerous permission: execute_commands'))).toBe(true)
    })
  })

  describe('Activation Events Validation', () => {
    it('should validate correct activation events', () => {
      const manifest = createValidManifest({
        activationEvents: ['onStartup', 'onCommand:myCommand', 'onLanguage:javascript']
      })
      
      const result = validator.validate(manifest)
      expect(result.valid).toBe(true)
    })

    it('should reject non-array activation events', () => {
      const manifest = createValidManifest({
        activationEvents: 'invalid'
      })
      
      const result = validator.validate(manifest)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('ActivationEvents must be an array')
    })

    it('should reject non-string activation events', () => {
      const manifest = createValidManifest({
        activationEvents: ['onStartup', 123]
      })
      
      const result = validator.validate(manifest)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Each activation event must be a string')
    })

    it('should warn about unknown activation events', () => {
      const manifest = createValidManifest({
        activationEvents: ['onStartup', 'onUnknownEvent']
      })
      
      const result = validator.validate(manifest)
      expect(result.valid).toBe(true)
      expect(result.warnings.some(w => w.includes('Unknown activation event: onUnknownEvent'))).toBe(true)
    })
  })

  describe('Contributes Validation', () => {
    it('should validate correct contributes section', () => {
      const manifest = createValidManifest({
        contributes: {
          commands: [{ command: 'myCommand', title: 'My Command' }],
          menus: { commandPalette: [{ command: 'myCommand' }] },
          keybindings: [{ command: 'myCommand', key: 'ctrl+shift+p' }]
        }
      })
      
      const result = validator.validate(manifest)
      expect(result.valid).toBe(true)
    })

    it('should reject non-object contributes', () => {
      const manifest = createValidManifest({
        contributes: 'invalid'
      })
      
      const result = validator.validate(manifest)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Contributes must be an object')
    })

    it('should validate common contribution types', () => {
      const manifest = createValidManifest({
        contributes: {
          commands: 'should-be-array',
          menus: 'should-be-object',
          keybindings: 'should-be-array'
        }
      })
      
      const result = validator.validate(manifest)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('contributes.commands must be an array')
      expect(result.errors).toContain('contributes.menus must be an object')
      expect(result.errors).toContain('contributes.keybindings must be an array')
    })

    it('should warn about unknown contributions', () => {
      const manifest = createValidManifest({
        contributes: {
          unknownContribution: {}
        }
      })
      
      const result = validator.validate(manifest)
      expect(result.valid).toBe(true)
      expect(result.warnings.some(w => w.includes('Unknown contribution: unknownContribution'))).toBe(true)
    })
  })

  describe('Categories Validation', () => {
    it('should validate correct categories', () => {
      const manifest = createValidManifest({
        categories: ['Editor', 'Theme', 'Other']
      })
      
      const result = validator.validate(manifest)
      expect(result.valid).toBe(true)
    })

    it('should reject non-array categories', () => {
      const manifest = createValidManifest({
        categories: 'invalid'
      })
      
      const result = validator.validate(manifest)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Categories must be an array')
    })

    it('should reject non-string categories', () => {
      const manifest = createValidManifest({
        categories: ['Editor', 123]
      })
      
      const result = validator.validate(manifest)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Each category must be a string')
    })

    it('should warn about unknown categories', () => {
      const manifest = createValidManifest({
        categories: ['Editor', 'UnknownCategory']
      })
      
      const result = validator.validate(manifest)
      expect(result.valid).toBe(true)
      expect(result.warnings.some(w => w.includes('Unknown category: UnknownCategory'))).toBe(true)
    })
  })

  describe('Validator State Management', () => {
    it('should reset state between validations', () => {
      // First validation with errors
      validator.validate({ invalid: 'manifest' })
      expect(validator.errors.length).toBeGreaterThan(0)
      
      // Second validation should reset state
      const result = validator.validate(createValidManifest())
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should correctly categorize errors and warnings', () => {
      const manifest = createValidManifest({
        name: 123, // Error
        permissions: ['unknown_permission'] // Warning
      })
      
      const result = validator.validate(manifest)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.warnings.length).toBeGreaterThan(0)
    })
  })

  describe('Utility Functions', () => {
    it('should validate manifest using convenience function', () => {
      const manifest = createValidManifest()
      const result = validateManifest(manifest)
      
      expect(result.valid).toBe(true)
    })

    it('should create valid manifest template', () => {
      const template = createManifestTemplate()
      const result = validateManifest(template)
      
      expect(result.valid).toBe(true)
    })

    it('should create manifest template with custom options', () => {
      const options = {
        id: 'custom-plugin',
        name: 'Custom Plugin',
        description: 'Custom description',
        permissions: ['read_files']
      }
      
      const template = createManifestTemplate(options)
      expect(template.id).toBe(options.id)
      expect(template.name).toBe(options.name)
      expect(template.description).toBe(options.description)
      expect(template.permissions).toEqual(options.permissions)
      
      const result = validateManifest(template)
      expect(result.valid).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty manifest', () => {
      const result = validator.validate({})
      
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBe(PLUGIN_MANIFEST_SCHEMA.required.length)
    })

    it('should handle manifest with extra unknown fields', () => {
      const manifest = {
        ...createValidManifest(),
        unknownField: 'value',
        anotherUnknown: 123
      }
      
      const result = validator.validate(manifest)
      expect(result.valid).toBe(true) // Unknown fields don't make it invalid
    })

    it('should handle complex nested structures', () => {
      const manifest = createValidManifest({
        author: {
          name: 'John Doe',
          email: 'john@example.com',
          url: 'https://johndoe.com'
        },
        repository: {
          type: 'git',
          url: 'https://github.com/user/repo'
        },
        contributes: {
          commands: [
            {
              command: 'extension.command1',
              title: 'Command 1'
            }
          ],
          menus: {
            commandPalette: [
              {
                command: 'extension.command1',
                when: 'editorTextFocus'
              }
            ]
          }
        }
      })
      
      const result = validator.validate(manifest)
      expect(result.valid).toBe(true)
    })
  })
})

// Helper function to create a valid base manifest
function createValidManifest(overrides = {}) {
  return {
    id: 'test-plugin',
    name: 'Test Plugin',
    version: '1.0.0',
    main: 'index.js',
    lokusVersion: '^1.0.0',
    ...overrides
  }
}