/**
 * Privacy utilities for Lokus crash reporting
 * Scrubs personally identifiable information (PII) from error reports before sending to Sentry
 *
 * @module utils/privacy
 */

import { readConfig } from '../core/config/store.js';

/**
 * Scrub file paths to remove usernames and home directories
 * Replaces home directory paths with ~ and removes potential usernames
 *
 * @param {string} path - File path to scrub
 * @returns {string} Scrubbed file path
 *
 * @example
 * // Input: /Users/john.smith/Documents/notes/file.txt
 * // Output: ~/Documents/notes/file.txt
 *
 * @example
 * // Input: C:\Users\john.smith\AppData\Local\notes.db
 * // Output: ~\AppData\Local\notes.db
 */
export function scrubFilePath(path) {
  if (!path || typeof path !== 'string') {
    return path;
  }

  let scrubbed = path;

  // Unix/Linux/macOS home directory patterns
  // /Users/username/ -> ~/
  // /home/username/ -> ~/
  scrubbed = scrubbed.replace(/\/Users\/[^\/]+\//g, '~/');
  scrubbed = scrubbed.replace(/\/home\/[^\/]+\//g, '~/');

  // Windows home directory patterns
  // C:\Users\username\ -> ~\
  scrubbed = scrubbed.replace(/[A-Z]:\\Users\\[^\\]+\\/gi, '~\\');

  // Remove any remaining username-like patterns in paths
  // /mnt/username/ -> /mnt/user/
  scrubbed = scrubbed.replace(/\/([a-z][a-z0-9._-]{2,})\//gi, (match, username) => {
    // Preserve common directory names
    const commonDirs = ['bin', 'lib', 'var', 'tmp', 'opt', 'usr', 'etc', 'home', 'root', 'mnt', 'srv', 'dev', 'proc', 'sys'];
    if (commonDirs.includes(username.toLowerCase())) {
      return match;
    }
    return '/user/';
  });

  return scrubbed;
}

/**
 * Scrub email addresses from text
 * Masks email addresses while preserving format for debugging
 *
 * @param {string} text - Text containing potential email addresses
 * @returns {string} Text with emails masked
 *
 * @example
 * // Input: "User john.doe@example.com logged in"
 * // Output: "User j***@***.com logged in"
 *
 * @example
 * // Input: "Contact: support@company.co.uk"
 * // Output: "Contact: s***@***.uk"
 */
export function scrubEmail(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // Email pattern: localpart@domain.tld
  const emailPattern = /\b([a-zA-Z0-9._-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g;

  return text.replace(emailPattern, (match, localPart, domain) => {
    // Keep first character of local part
    const maskedLocal = localPart.charAt(0) + '***';

    // Mask domain but keep TLD
    const domainParts = domain.split('.');
    const tld = domainParts[domainParts.length - 1];
    const maskedDomain = '***.' + tld;

    return `${maskedLocal}@${maskedDomain}`;
  });
}

/**
 * Scrub authentication tokens and API keys from text
 * Removes Bearer tokens, OAuth tokens, API keys, and other sensitive credentials
 *
 * @param {string} text - Text containing potential tokens
 * @returns {string} Text with tokens redacted
 *
 * @example
 * // Input: "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * // Output: "Authorization: [REDACTED_TOKEN]"
 *
 * @example
 * // Input: "api_key=sk_live_51HqG8HLkjsdf..."
 * // Output: "api_key=[REDACTED_TOKEN]"
 */
export function scrubTokens(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let scrubbed = text;

  // Bearer tokens (JWT and others)
  // Pattern: Bearer <base64-like-string>
  scrubbed = scrubbed.replace(/Bearer\s+[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_.+/=]*/gi, '[REDACTED_TOKEN]');

  // OAuth tokens
  // Pattern: oauth_token=<token>
  scrubbed = scrubbed.replace(/oauth_token[=:]\s*[A-Za-z0-9\-_.+/=]+/gi, 'oauth_token=[REDACTED_TOKEN]');

  // API keys (various patterns)
  // Pattern: api_key=<key>, apikey=<key>, x-api-key: <key>
  scrubbed = scrubbed.replace(/api[_-]?key[=:]\s*[A-Za-z0-9\-_.+/=]+/gi, 'api_key=[REDACTED_TOKEN]');
  scrubbed = scrubbed.replace(/x-api-key[=:]\s*[A-Za-z0-9\-_.+/=]+/gi, 'x-api-key=[REDACTED_TOKEN]');

  // Generic access tokens
  // Pattern: access_token=<token>
  scrubbed = scrubbed.replace(/access[_-]?token[=:]\s*[A-Za-z0-9\-_.+/=]+/gi, 'access_token=[REDACTED_TOKEN]');

  // Secret keys (AWS, Stripe, etc.)
  // Pattern: sk_live_<key>, sk_test_<key>
  scrubbed = scrubbed.replace(/sk_(live|test)_[A-Za-z0-9]+/gi, '[REDACTED_SECRET_KEY]');

  // AWS keys
  // Pattern: AKIA<20 chars>
  scrubbed = scrubbed.replace(/AKIA[A-Z0-9]{16}/g, '[REDACTED_AWS_KEY]');

  // Generic secret patterns
  // Pattern: secret=<value>, password=<value>
  scrubbed = scrubbed.replace(/secret[=:]\s*[A-Za-z0-9\-_.+/=]+/gi, 'secret=[REDACTED]');
  scrubbed = scrubbed.replace(/password[=:]\s*[^\s&]+/gi, 'password=[REDACTED]');

  // GitHub tokens
  // Pattern: ghp_<40 chars>, gho_<40 chars>, ghs_<40 chars>
  scrubbed = scrubbed.replace(/gh[pso]_[A-Za-z0-9]{36,}/g, '[REDACTED_GITHUB_TOKEN]');

  // JWT tokens (standalone, not Bearer)
  // Pattern: eyJ<base64>.<base64>.<base64>
  scrubbed = scrubbed.replace(/eyJ[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_.+/=]*/g, '[REDACTED_JWT]');

  return scrubbed;
}

/**
 * Scrub breadcrumbs to remove sensitive data
 * Filters out breadcrumbs containing sensitive keywords and scrubs remaining ones
 *
 * @param {Array<Object>} breadcrumbs - Array of Sentry breadcrumb objects
 * @returns {Array<Object>} Filtered and scrubbed breadcrumbs
 *
 * @example
 * // Input: [
 * //   { message: "User clicked save", category: "ui.click" },
 * //   { message: "Note content: My secret diary...", category: "note" },
 * //   { message: "API call to /api/notes", category: "http" }
 * // ]
 * // Output: [
 * //   { message: "User clicked save", category: "ui.click" },
 * //   { message: "API call to /api/notes", category: "http" }
 * // ]
 */
export function scrubBreadcrumbs(breadcrumbs) {
  if (!Array.isArray(breadcrumbs)) {
    return breadcrumbs;
  }

  // Sensitive keywords that indicate PII in breadcrumbs
  const sensitiveKeywords = [
    'note_content',
    'file_content',
    'content:',
    'email',
    'password',
    'token',
    'secret',
    'credential',
    'auth',
    'session',
    'cookie',
    'private',
    'ssn',
    'credit_card',
    'card_number',
    'cvv',
    'pin',
    'api_key',
    'access_token',
  ];

  return breadcrumbs
    .filter(breadcrumb => {
      if (!breadcrumb) return false;

      // Check message for sensitive keywords
      const message = breadcrumb.message || '';
      const messageLower = message.toLowerCase();

      if (sensitiveKeywords.some(keyword => messageLower.includes(keyword.toLowerCase()))) {
        return false; // Filter out this breadcrumb
      }

      // Check data object for sensitive keys
      if (breadcrumb.data) {
        const dataKeys = Object.keys(breadcrumb.data).join(' ').toLowerCase();
        if (sensitiveKeywords.some(keyword => dataKeys.includes(keyword.toLowerCase()))) {
          return false; // Filter out this breadcrumb
        }
      }

      return true;
    })
    .map(breadcrumb => {
      // Create a copy to avoid mutating original
      const scrubbed = { ...breadcrumb };

      // Scrub message
      if (scrubbed.message) {
        scrubbed.message = scrubFilePath(scrubbed.message);
        scrubbed.message = scrubEmail(scrubbed.message);
        scrubbed.message = scrubTokens(scrubbed.message);
      }

      // Scrub data object
      if (scrubbed.data) {
        scrubbed.data = scrubObject(scrubbed.data);
      }

      return scrubbed;
    });
}

/**
 * Recursively scrub an object of sensitive data
 * Internal helper function for deep scrubbing
 *
 * @param {Object} obj - Object to scrub
 * @returns {Object} Scrubbed object
 * @private
 */
function scrubObject(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => scrubObject(item));
  }

  const scrubbed = {};
  const sensitiveKeys = ['password', 'token', 'secret', 'api_key', 'apikey', 'authorization', 'auth', 'credential', 'cookie', 'session'];

  for (const [key, value] of Object.entries(obj)) {
    const keyLower = key.toLowerCase();

    // Redact values of sensitive keys
    if (sensitiveKeys.some(sensitiveKey => keyLower.includes(sensitiveKey))) {
      scrubbed[key] = '[REDACTED]';
      continue;
    }

    // Recursively scrub nested objects
    if (value && typeof value === 'object') {
      scrubbed[key] = scrubObject(value);
    } else if (typeof value === 'string') {
      // Scrub string values
      let scrubbedValue = scrubFilePath(value);
      scrubbedValue = scrubEmail(scrubbedValue);
      scrubbedValue = scrubTokens(scrubbedValue);
      scrubbed[key] = scrubbedValue;
    } else {
      scrubbed[key] = value;
    }
  }

  return scrubbed;
}

/**
 * Main Sentry beforeSend hook
 * Checks user consent and scrubs all PII from error events before sending
 *
 * @param {Object} event - Sentry event object
 * @param {Object} hint - Sentry hint object with original exception
 * @returns {Object|null} Scrubbed event or null if user opted out
 *
 * @example
 * // Usage in Sentry.init():
 * Sentry.init({
 *   dsn: '...',
 *   beforeSend: beforeSendHook,
 * });
 */
export async function beforeSendHook(event, hint) {
  try {
    // Check user consent from config
    const config = await readConfig();

    // If user has not consented to crash reporting, don't send
    if (!config?.privacy?.crashReporting) {
      console.log('[Privacy] User has not consented to crash reporting. Event not sent.');
      return null;
    }

    // Create a deep copy to avoid mutating the original event
    const scrubbedEvent = JSON.parse(JSON.stringify(event));

    // Scrub exception messages and stack traces
    if (scrubbedEvent.exception?.values) {
      scrubbedEvent.exception.values = scrubbedEvent.exception.values.map(exception => {
        if (exception.value) {
          exception.value = scrubFilePath(exception.value);
          exception.value = scrubEmail(exception.value);
          exception.value = scrubTokens(exception.value);
        }

        if (exception.stacktrace?.frames) {
          exception.stacktrace.frames = exception.stacktrace.frames.map(frame => {
            if (frame.filename) {
              frame.filename = scrubFilePath(frame.filename);
            }
            if (frame.abs_path) {
              frame.abs_path = scrubFilePath(frame.abs_path);
            }
            // Scrub local variables
            if (frame.vars) {
              frame.vars = scrubObject(frame.vars);
            }
            return frame;
          });
        }

        return exception;
      });
    }

    // Scrub message
    if (scrubbedEvent.message) {
      scrubbedEvent.message = scrubFilePath(scrubbedEvent.message);
      scrubbedEvent.message = scrubEmail(scrubbedEvent.message);
      scrubbedEvent.message = scrubTokens(scrubbedEvent.message);
    }

    // Scrub breadcrumbs
    if (scrubbedEvent.breadcrumbs) {
      scrubbedEvent.breadcrumbs = scrubBreadcrumbs(scrubbedEvent.breadcrumbs);
    }

    // Scrub request data
    if (scrubbedEvent.request) {
      scrubbedEvent.request = scrubObject(scrubbedEvent.request);
    }

    // Scrub user data
    if (scrubbedEvent.user) {
      // Remove email if present
      if (scrubbedEvent.user.email) {
        scrubbedEvent.user.email = scrubEmail(scrubbedEvent.user.email);
      }
      // Remove username if it looks like an email or contains PII
      if (scrubbedEvent.user.username) {
        if (scrubbedEvent.user.username.includes('@')) {
          scrubbedEvent.user.username = scrubEmail(scrubbedEvent.user.username);
        }
      }
      // Remove IP address
      if (scrubbedEvent.user.ip_address) {
        delete scrubbedEvent.user.ip_address;
      }
    }

    // Scrub contexts
    if (scrubbedEvent.contexts) {
      scrubbedEvent.contexts = scrubObject(scrubbedEvent.contexts);
    }

    // Scrub extra data
    if (scrubbedEvent.extra) {
      scrubbedEvent.extra = scrubObject(scrubbedEvent.extra);
    }

    // Scrub tags
    if (scrubbedEvent.tags) {
      scrubbedEvent.tags = scrubObject(scrubbedEvent.tags);
    }

    console.log('[Privacy] Event scrubbed successfully');
    return scrubbedEvent;

  } catch (error) {
    // If scrubbing fails, don't send the event to be safe
    console.error('[Privacy] Error scrubbing event:', error);
    return null;
  }
}

/**
 * Test data patterns (for development and validation)
 * These patterns represent real-world data that should be scrubbed
 */

/* TEST CASES:

// Test scrubFilePath:
console.assert(scrubFilePath('/Users/john.smith/Documents/notes.txt') === '~/Documents/notes.txt');
console.assert(scrubFilePath('/home/alice/projects/lokus/main.js') === '~/projects/lokus/main.js');
console.assert(scrubFilePath('C:\\Users\\bob\\AppData\\Local\\notes.db') === '~\\AppData\\Local\\notes.db');
console.assert(scrubFilePath('/opt/lokus/bin') === '/opt/lokus/bin'); // Should preserve system paths

// Test scrubEmail:
console.assert(scrubEmail('Contact john.doe@example.com for info') === 'Contact j***@***.com for info');
console.assert(scrubEmail('support@company.co.uk') === 's***@***.uk');
console.assert(scrubEmail('No email here!') === 'No email here!');

// Test scrubTokens:
console.assert(scrubTokens('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature') === '[REDACTED_TOKEN]');
console.assert(scrubTokens('api_key=sk_live_51HqG8HLkjsdfABC123') === 'api_key=[REDACTED_SECRET_KEY]');
console.assert(scrubTokens('password=mysecret123') === 'password=[REDACTED]');
console.assert(scrubTokens('Authorization: Bearer token123.abc.xyz') === 'Authorization: [REDACTED_TOKEN]');
console.assert(scrubTokens('ghp_1234567890abcdefghijklmnopqrstuvwxyz12') === '[REDACTED_GITHUB_TOKEN]');

// Test scrubBreadcrumbs:
const testBreadcrumbs = [
  { message: 'User clicked save', category: 'ui.click' },
  { message: 'Note content: Private diary entry', category: 'note' },
  { message: 'API call to /api/notes', category: 'http' },
  { message: 'Email sent to user@example.com', category: 'email' },
];
const scrubbed = scrubBreadcrumbs(testBreadcrumbs);
console.assert(scrubbed.length === 2); // Should filter out note_content and email
console.assert(scrubbed[0].message === 'User clicked save');
console.assert(scrubbed[1].message === 'API call to /api/notes');

// Test beforeSendHook:
const testEvent = {
  message: 'Error in /Users/john/notes.txt with token Bearer abc123.def.ghi',
  exception: {
    values: [{
      value: 'Failed to load file C:\\Users\\jane\\Documents\\secret.txt',
      stacktrace: {
        frames: [{
          filename: '/home/user/project/index.js',
          abs_path: '/home/user/project/index.js',
        }]
      }
    }]
  },
  user: {
    email: 'john.doe@example.com',
    ip_address: '192.168.1.1'
  },
  breadcrumbs: [
    { message: 'User logged in', category: 'auth' },
    { message: 'Password entered', category: 'input' },
  ]
};

// Mock getConfig for testing
// In production, this would check actual user consent
// const scrubbedEvent = await beforeSendHook(testEvent, {});
// console.assert(scrubbedEvent.message.includes('~')); // Path should be scrubbed
// console.assert(scrubbedEvent.message.includes('[REDACTED')); // Token should be scrubbed
// console.assert(scrubbedEvent.user.email === 'j***@***.com'); // Email should be masked
// console.assert(!scrubbedEvent.user.ip_address); // IP should be removed
// console.assert(scrubbedEvent.breadcrumbs.length === 1); // Password breadcrumb should be filtered

*/

export default {
  scrubFilePath,
  scrubEmail,
  scrubTokens,
  scrubBreadcrumbs,
  beforeSendHook,
};
