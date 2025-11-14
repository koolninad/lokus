# Privacy Policy - Crash Reporting

Last Updated: January 2025

## Overview

Lokus includes an **optional** crash reporting system to help us improve the app by identifying and fixing bugs. This document explains exactly what data we collect, how we use it, and how you maintain control.

## Your Privacy is Our Priority

- Crash reporting is **opt-in by default** - you choose whether to help us
- All data is **anonymized** before being sent
- **No personal information** is collected
- You can **opt-out at any time** in Preferences
- We use **self-hosted infrastructure** - we control all data

## What We Collect (If You Opt-In)

When the app crashes or encounters an error, we collect:

### Technical Information
- **Error messages and stack traces** - What went wrong and where in the code
- **App version** - Which version you're using (e.g., "1.3.3")
- **Operating system** - macOS, Windows, or Linux and version
- **Anonymous device ID** - Random identifier (not linked to you)
- **Timestamp** - When the error occurred

### User Actions (Breadcrumbs)
- **UI interactions** - Which buttons you clicked before the crash
- **Navigation** - Which screens you visited
- **System events** - App startup, preferences changed, etc.

## What We DON'T Collect

We explicitly filter out:

- ❌ **Your notes or file contents** - Never collected
- ❌ **File paths** - Anonymized to remove usernames (e.g., `/Users/john/` → `~/`)
- ❌ **Email addresses** - Masked if present (e.g., `john@example.com` → `j***@***.com`)
- ❌ **Authentication tokens** - Always redacted
- ❌ **API keys or passwords** - Always redacted
- ❌ **Personal information** - Nothing that identifies you

## How Data is Anonymized

Before any error report leaves your device, we:

1. **Scrub file paths** - Remove usernames and personal directories
2. **Mask emails** - Replace with `***` while keeping format
3. **Redact tokens** - Remove Bearer tokens, API keys, passwords
4. **Filter breadcrumbs** - Remove any containing sensitive keywords
5. **Strip user data** - No names, emails, or personal info

**Example:**
```
Before: Failed to load /Users/john/Documents/note.md with token Bearer abc123
After:  Failed to load ~/user/note.md with token [REDACTED_TOKEN]
```

## How We Use This Data

Crash reports help us:

- **Find and fix bugs** - Understand what causes crashes
- **Improve stability** - Identify common error patterns
- **Prioritize fixes** - Focus on issues affecting most users
- **Test thoroughly** - Ensure fixes work across platforms

We **never** use this data for:
- ❌ Marketing or advertising
- ❌ Tracking your usage
- ❌ Profiling or analytics
- ❌ Selling to third parties

## Your Control

### Opting Out

You can disable crash reporting at any time:

1. Open Lokus Preferences (⌘+, or Ctrl+,)
2. Go to "Privacy & Data"
3. Toggle off "Send crash reports to help improve Lokus"

Once disabled, **no data** is sent to our servers.

### Verifying Our Claims

Lokus is **open source**. You can verify our privacy claims:

- **Privacy utilities**: [src/utils/privacy.js](https://github.com/lokus-ai/lokus/blob/main/src/utils/privacy.js)
- **Rust privacy module**: [src-tauri/src/privacy.rs](https://github.com/lokus-ai/lokus/blob/main/src-tauri/src/privacy.rs)
- **Sentry integration**: [src/main.jsx](https://github.com/lokus-ai/lokus/blob/main/src/main.jsx)

All privacy filtering code is transparent and auditable.

## Data Storage & Security

- **Self-hosted** - We run our own crash reporting server (GlitchTip)
- **No third parties** - Data never goes to external services
- **Encrypted transmission** - HTTPS/SSL for all data sent
- **Automatic cleanup** - Old crash reports deleted after 90 days
- **Secure infrastructure** - Protected by Cloudflare

## Technical Details

For developers and security researchers:

### Tools Used
- **Sentry SDK** - Industry-standard error tracking
- **GlitchTip** - Open-source, self-hosted alternative to Sentry SaaS
- **Cloudflare Tunnel** - Secure access without port forwarding

### Data Flow
```
Your Computer → Privacy Filter → Encrypted HTTPS → Cloudflare → Our Server
```

### Privacy Implementation
- **Frontend**: [src/utils/privacy.js](../src/utils/privacy.js)
- **Backend**: [src-tauri/src/privacy.rs](../src-tauri/src/privacy.rs)
- **Tests**: [tests/unit/privacy.test.js](../tests/unit/privacy.test.js)

### Verification
Run the privacy tests yourself:
```bash
npm test tests/unit/privacy.test.js
```

All 28 tests verify that PII scrubbing works correctly.

## Questions or Concerns?

- **File an issue**: [GitHub Issues](https://github.com/lokus-ai/lokus/issues)
- **Email**: [Report a privacy concern]
- **View source**: All code is transparent and open-source

## Changes to This Policy

We may update this privacy policy as we add features. We'll always:
- Update the "Last Updated" date
- Notify you of material changes
- Maintain user control and transparency

## Summary

- **Optional** - You decide whether to help us improve Lokus
- **Transparent** - All code is open-source and auditable
- **Anonymous** - No personal data collected
- **Secure** - Self-hosted infrastructure we control
- **Respectful** - You can opt-out anytime

Thank you for helping us make Lokus better!
