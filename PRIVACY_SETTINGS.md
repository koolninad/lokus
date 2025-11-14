# Privacy Settings Configuration

## Overview

Privacy settings have been added to the Lokus configuration schema to give users control over crash reporting and data sharing.

## Configuration Structure

```javascript
{
  privacy: {
    crashReporting: true,        // OPT-IN by default (user can opt-out in preferences)
    anonymizePaths: true,         // Always anonymize file paths
    anonymizeEmails: true,        // Always anonymize emails
    sharePerformanceData: false   // Don't share performance metrics by default
  }
}
```

## Default Values

All new and existing configurations will automatically receive these defaults:

- **crashReporting**: `true` - Enabled by default to help improve Lokus by understanding crashes
- **anonymizePaths**: `true` - Always scrub file paths from crash reports to protect user privacy
- **anonymizeEmails**: `true` - Always scrub email addresses from crash reports
- **sharePerformanceData**: `false` - Don't share performance metrics by default (user can opt-in)

## Backward Compatibility

Existing users without privacy settings will automatically receive the defaults when they load their config. No manual migration is required.

## Usage Examples

### Reading Privacy Settings

```javascript
import { readConfig } from './src/core/config/store.js'

const config = await readConfig()
console.log(config.privacy.crashReporting) // true
console.log(config.privacy.anonymizePaths) // true
```

### Updating Privacy Settings

```javascript
import { updateConfig } from './src/core/config/store.js'

// Update specific privacy settings (other settings are preserved)
await updateConfig({
  privacy: {
    crashReporting: false  // User opts out of crash reporting
  }
})
```

### Writing Complete Config

```javascript
import { writeConfig } from './src/core/config/store.js'

await writeConfig({
  theme: 'dark',
  privacy: {
    crashReporting: true,
    anonymizePaths: true,
    anonymizeEmails: true,
    sharePerformanceData: true  // User opts in to performance data
  }
})
```

## Validation

All privacy settings are validated to ensure they are boolean values:

- Invalid values (non-boolean) are replaced with defaults
- Missing fields are filled with defaults
- The privacy object structure is always maintained

## Implementation Details

### Files Modified

1. **`/Users/pratham/Programming/Lokud Dir/Lokus-Main/src/core/config/store.js`**
   - Added `DEFAULT_PRIVACY_SETTINGS` constant
   - Added `validatePrivacySettings()` function for validation
   - Added `ensurePrivacyDefaults()` function for migration
   - Updated `readConfig()` to apply privacy defaults
   - Updated `writeConfig()` to validate privacy settings
   - Updated `updateConfig()` to merge privacy settings (not replace)

2. **`/Users/pratham/Programming/Lokud Dir/Lokus-Main/src/core/config/store.test.js`**
   - Added comprehensive privacy settings tests
   - Tests cover: defaults, migration, validation, partial updates

3. **`/Users/pratham/Programming/Lokud Dir/Lokus-Main/src/test-setup.js`**
   - Fixed localStorage mock to actually store data (was returning null)

## Testing

All tests pass successfully:

```bash
npm test -- src/core/config/store.test.js
```

Test coverage includes:
- Default privacy settings on first read
- Migration for existing configs without privacy
- Preservation of user preferences
- Validation of non-boolean values
- Handling of partial privacy settings
- Handling of null/invalid privacy objects
- Proper merging in updateConfig

## Next Steps for UI Integration

To integrate these settings into the Preferences UI:

1. Add a "Privacy" section to Preferences.jsx
2. Add toggle switches for each privacy setting
3. Use `updateConfig({ privacy: { ... } })` to save user changes
4. Display explanatory text for each option
5. Potentially add a "Learn More" link about crash reporting
