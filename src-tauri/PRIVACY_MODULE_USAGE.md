# Privacy Module Usage Guide

## Overview

The privacy module (`src/privacy.rs`) provides comprehensive data scrubbing functionality to protect user privacy when reporting crashes or errors. It's designed to remove or anonymize sensitive information before sending error reports.

## Quick Start

```rust
use crate::privacy::anonymize_error_message;

// Example: Anonymize an error before sending to crash reporting service
let error_message = "Failed to load /Users/john/config.json with token Bearer abc123";
let safe_message = anonymize_error_message(error_message);
// Result: "Failed to load ~/config.json with token [REDACTED]"
```

## Available Functions

### 1. `anonymize_error_message(msg: &str) -> String`

**Primary function** - Applies all scrubbing operations at once. Use this for crash reporting.

```rust
let error = "API error at /Users/john/app with Bearer abc123 from john@example.com";
let safe = anonymize_error_message(error);
// All sensitive data is scrubbed automatically
```

### 2. `scrub_file_path(path: &str) -> String`

Scrubs file paths by replacing home directories with `~` and removing usernames.

```rust
// macOS
scrub_file_path("/Users/john/Documents/file.txt");
// → "~/Documents/file.txt"

// Linux
scrub_file_path("/home/jane/projects/app");
// → "~/projects/app"

// Windows
scrub_file_path("C:\\Users\\bob\\Desktop\\file.txt");
// → "~\\Desktop\\file.txt"
```

### 3. `scrub_email(text: &str) -> String`

Masks email addresses while preserving format.

```rust
scrub_email("Contact user@example.com for help");
// → "Contact u***@***.com for help"
```

### 4. `scrub_tokens(text: &str) -> String`

Removes all types of authentication tokens:
- Bearer tokens
- OAuth tokens (access_token, refresh_token, oauth_token)
- JWT tokens
- API keys
- Stripe keys (sk_live_, pk_test_, etc.)
- Authorization headers
- Passwords in connection strings

```rust
scrub_tokens("Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
// → "Authorization: [REDACTED]"

scrub_tokens("postgres://admin:password123@localhost:5432/db");
// → "postgres://admin:[REDACTED]@localhost:5432/db"
```

### 5. `should_send_crash_report() -> bool`

Checks user consent for crash reporting.

```rust
if should_send_crash_report() {
    send_crash_report(anonymize_error_message(&error));
}
```

## Integration Example

Here's how to integrate the privacy module into your crash reporting:

```rust
use crate::privacy::{anonymize_error_message, should_send_crash_report};

fn handle_crash(error: &str, stack_trace: &str) {
    // Check if user has consented to crash reporting
    if !should_send_crash_report() {
        eprintln!("Crash reporting disabled by user");
        return;
    }

    // Anonymize sensitive data
    let safe_error = anonymize_error_message(error);
    let safe_stack = anonymize_error_message(stack_trace);

    // Send to crash reporting service
    send_to_crash_service(safe_error, safe_stack);
}
```

## Panic Hook Integration

```rust
use std::panic;
use crate::privacy::anonymize_error_message;

fn setup_panic_hook() {
    panic::set_hook(Box::new(|panic_info| {
        let payload = panic_info.to_string();
        let safe_payload = anonymize_error_message(&payload);

        // Log locally
        eprintln!("Application panic: {}", safe_payload);

        // Send to crash reporting if enabled
        if should_send_crash_report() {
            send_crash_report(safe_payload);
        }
    }));
}
```

## What Gets Scrubbed

### File Paths
- **macOS**: `/Users/username/...` → `~/...`
- **Linux**: `/home/username/...` → `~/...`
- **Windows**: `C:\Users\username\...` → `~\...`

### Email Addresses
- `user@domain.com` → `u***@***.com`
- `john.doe@example.co.uk` → `j***@***.uk`

### Tokens & Secrets
- Bearer tokens: `Bearer abc123` → `[REDACTED]`
- OAuth tokens: `access_token=xyz789` → `access_token=[REDACTED]`
- JWT tokens: `eyJhbG...` → `[REDACTED]`
- API keys: `api_key=sk_test_123...` → `api_key=[REDACTED]`
- Stripe keys: `sk_live_abc123...` → `[REDACTED]`
- Passwords: `password=secret` → `password=[REDACTED]`
- Connection strings: `postgres://user:pass@host` → `postgres://user:[REDACTED]@host`

### Authorization Headers
- `Authorization: Basic dXNlcjpwYXNz` → `Authorization: [REDACTED]`
- `Authorization: Bearer token123` → `Authorization: [REDACTED]`

## Performance

The module is optimized for performance:
- Regexes are compiled once at startup using `Lazy<Regex>`
- Handles large text efficiently (tested with 1000+ entries)
- Typical processing time: <100ms for large error messages

## Testing

Run the comprehensive test suite:

```bash
cd src-tauri
cargo test privacy::
```

The module includes 28+ test cases covering:
- All major operating systems (macOS, Linux, Windows)
- Multiple file path formats
- Various email formats
- Different token types
- Edge cases (empty strings, malformed data)
- Real-world error scenarios
- Performance benchmarks

## TODO: Configuration Integration

Currently, `should_send_crash_report()` returns `true` by default. You should integrate it with your app's configuration system:

```rust
pub fn should_send_crash_report() -> bool {
    // TODO: Check user preferences from config/settings store
    // Example:
    // let config = load_app_config();
    // config.crash_reporting_enabled
    true
}
```

## Security Notes

1. **Defense in Depth**: The module uses multiple regex patterns to catch various formats of sensitive data.
2. **Order Matters**: Specific patterns (JWT, Stripe keys) are checked before general patterns to avoid false matches.
3. **Fail-Safe**: If scrubbing fails, the original text is returned to avoid breaking error reporting entirely.
4. **Local First**: Always log the original error locally (with proper file permissions) before anonymizing for remote reporting.

## Best Practices

1. **Always anonymize before sending**: Never send raw error messages to external services.
2. **Log locally first**: Keep detailed logs locally for debugging, only send anonymized versions remotely.
3. **Test with real data**: Use real error messages in your tests to ensure scrubbing works correctly.
4. **Respect user choice**: Check `should_send_crash_report()` before sending any data.
5. **Be transparent**: Inform users what data is collected and how it's anonymized.

## Example: Complete Error Handling

```rust
use crate::privacy::{anonymize_error_message, should_send_crash_report};
use std::fs::OpenOptions;
use std::io::Write;

fn handle_error(error: &str, severity: &str) {
    // Always log full details locally (with proper permissions)
    if let Ok(mut file) = OpenOptions::new()
        .create(true)
        .append(true)
        .open("app_errors.log")
    {
        writeln!(file, "[{}] {}", severity, error).ok();
    }

    // For remote reporting, anonymize first
    if should_send_crash_report() && severity == "CRITICAL" {
        let safe_error = anonymize_error_message(error);
        send_to_remote_service(safe_error);
    }
}
```

## Questions or Issues?

If you find sensitive data that isn't being scrubbed, please:
1. Add a test case to `src/privacy.rs`
2. Update the regex patterns to catch the new pattern
3. Ensure the tests pass

The module is designed to be extensible - adding new scrubbing patterns is straightforward.
