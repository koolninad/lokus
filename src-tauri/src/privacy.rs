//! Privacy module for Lokus crash reporting
//!
//! This module provides comprehensive data scrubbing functionality to protect user privacy
//! when reporting crashes or errors. It removes or anonymizes sensitive information such as:
//! - File paths containing usernames
//! - Email addresses
//! - Authentication tokens (Bearer, OAuth, JWT, API keys)
//! - Authorization headers
//!
//! # Examples
//!
//! ```
//! use privacy::anonymize_error_message;
//!
//! let error = "Failed to read /Users/john/Documents/secret.txt with token Bearer abc123";
//! let anonymized = anonymize_error_message(error);
//! // Result: "Failed to read ~/Documents/secret.txt with token [REDACTED]"
//! ```

use regex::Regex;
use once_cell::sync::Lazy;

// Compile regexes once at startup for performance
static EMAIL_REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"(?i)\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b").unwrap()
});

static BEARER_TOKEN_REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"(?i)Bearer\s+[A-Za-z0-9\-._~+/]+=*").unwrap()
});

static OAUTH_TOKEN_REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r#"(?i)(oauth_token|access_token|refresh_token|token)[=:\s]+['"]?[A-Za-z0-9\-._~+/]{3,}['"]?"#).unwrap()
});

static JWT_TOKEN_REGEX: Lazy<Regex> = Lazy::new(|| {
    // JWT tokens have 3 parts separated by dots: header.payload.signature
    Regex::new(r"\beyJ[A-Za-z0-9\-_]+\.eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\b").unwrap()
});

static API_KEY_REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r#"(?i)(api[_-]?key|apikey|api_secret|secret_key)[=:\s]+['"]?[A-Za-z0-9\-._~+/]{3,}['"]?"#).unwrap()
});

static STRIPE_KEY_REGEX: Lazy<Regex> = Lazy::new(|| {
    // Match Stripe-style keys: sk_live_, sk_test_, pk_live_, pk_test_, etc.
    Regex::new(r"\b(sk|pk|rk)_(live|test)_[A-Za-z0-9]{16,}\b").unwrap()
});

static AUTH_HEADER_REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"(?i)Authorization:\s*[^\n\r]+").unwrap()
});

static PASSWORD_REGEX: Lazy<Regex> = Lazy::new(|| {
    // Match password/passwd/pwd followed by = or : and the value (until whitespace, quote, or @)
    Regex::new(r#"(?i)(password|passwd|pwd)[=:]\s*['"]?([^\s'"@]+)['"]?"#).unwrap()
});

/// Scrubs file paths by replacing home directories with ~ and removing usernames
///
/// This function handles paths on all major operating systems:
/// - macOS: `/Users/username/...` → `~/...`
/// - Linux: `/home/username/...` → `~/...`
/// - Windows: `C:\Users\username\...` → `~\...`
///
/// # Arguments
///
/// * `path` - The file path to scrub
///
/// # Returns
///
/// A scrubbed version of the path with sensitive information removed
///
/// # Examples
///
/// ```
/// let path = "/Users/john/Documents/file.txt";
/// let scrubbed = scrub_file_path(path);
/// assert_eq!(scrubbed, "~/Documents/file.txt");
/// ```
pub fn scrub_file_path(path: &str) -> String {
    if path.is_empty() {
        return path.to_string();
    }

    let mut result = path.to_string();

    // Try to get the actual home directory
    if let Some(home_dir) = dirs::home_dir() {
        if let Some(home_str) = home_dir.to_str() {
            result = result.replace(home_str, "~");
        }
    }

    // Fallback patterns for common home directory structures
    // IMPORTANT: Check Windows patterns FIRST before Unix patterns
    // because Windows paths can contain /Users/ which would match the macOS pattern

    // Windows patterns - need to capture and handle drive letter + path separator
    // C:\Users\username\ or C:/Users/username/
    let windows_backslash_regex = Regex::new(r"(?i)[A-Z]:\\Users\\[^\\]+").unwrap();
    result = windows_backslash_regex.replace_all(&result, "~").to_string();

    let windows_forward_regex = Regex::new(r"(?i)[A-Z]:/Users/[^/]+").unwrap();
    result = windows_forward_regex.replace_all(&result, "~").to_string();

    // macOS pattern: /Users/username
    let macos_regex = Regex::new(r"/Users/[^/]+").unwrap();
    result = macos_regex.replace_all(&result, "~").to_string();

    // Linux pattern: /home/username
    let linux_regex = Regex::new(r"/home/[^/]+").unwrap();
    result = linux_regex.replace_all(&result, "~").to_string();

    result
}

/// Scrubs email addresses by masking the local part and domain
///
/// Converts `user@domain.com` to `u***@***.com` to preserve format while hiding identity
///
/// # Arguments
///
/// * `text` - The text containing email addresses
///
/// # Returns
///
/// Text with all email addresses masked
pub fn scrub_email(text: &str) -> String {
    EMAIL_REGEX.replace_all(text, |caps: &regex::Captures| {
        let email = &caps[0];
        if let Some(at_pos) = email.find('@') {
            let local = &email[..at_pos];
            let domain = &email[at_pos + 1..];

            // Mask local part - show first char only
            let masked_local = if local.len() > 0 {
                format!("{}***", &local[..1.min(local.len())])
            } else {
                "***".to_string()
            };

            // Mask domain - show TLD only
            let masked_domain = if let Some(dot_pos) = domain.rfind('.') {
                format!("***.{}", &domain[dot_pos + 1..])
            } else {
                "***".to_string()
            };

            format!("{}@{}", masked_local, masked_domain)
        } else {
            "[EMAIL_REDACTED]".to_string()
        }
    }).to_string()
}

/// Scrubs authentication tokens including Bearer tokens, OAuth tokens, JWT tokens, and API keys
///
/// # Arguments
///
/// * `text` - The text containing tokens
///
/// # Returns
///
/// Text with all tokens replaced with [REDACTED]
pub fn scrub_tokens(text: &str) -> String {
    let mut result = text.to_string();

    // Scrub connection strings with passwords (e.g., postgres://user:password@host)
    let connection_string_regex = Regex::new(r"([a-zA-Z]+://[^:]+:)([^@]+)(@)").unwrap();
    result = connection_string_regex.replace_all(&result, "${1}[REDACTED]${3}").to_string();

    // Scrub Stripe-style API keys (must be before general token patterns)
    result = STRIPE_KEY_REGEX.replace_all(&result, "[REDACTED]").to_string();

    // Scrub JWT tokens (must be before general token patterns)
    result = JWT_TOKEN_REGEX.replace_all(&result, "[REDACTED]").to_string();

    // Scrub Bearer tokens
    result = BEARER_TOKEN_REGEX.replace_all(&result, "[REDACTED]").to_string();

    // Scrub OAuth tokens
    result = OAUTH_TOKEN_REGEX.replace_all(&result, "$1=[REDACTED]").to_string();

    // Scrub API keys
    result = API_KEY_REGEX.replace_all(&result, "$1=[REDACTED]").to_string();

    // Scrub Authorization headers
    result = AUTH_HEADER_REGEX.replace_all(&result, "Authorization: [REDACTED]").to_string();

    // Scrub passwords
    result = PASSWORD_REGEX.replace_all(&result, "$1=[REDACTED]").to_string();

    result
}

/// Checks if the user has consented to sending crash reports
///
/// This should check the application's configuration/settings to determine
/// if the user has opted in to crash reporting.
///
/// # Returns
///
/// `true` if crash reports should be sent, `false` otherwise
///
/// # Note
///
/// Currently returns `true` by default. In production, this should check
/// actual user preferences from the application's config store.
pub fn should_send_crash_report() -> bool {
    // TODO: Implement actual config check
    // This should read from the app's settings store to check user consent
    // For now, we default to true for development
    true
}

/// Main anonymization function that applies all scrubbing operations
///
/// This is the primary entry point for anonymizing error messages before
/// sending them in crash reports. It applies all available scrubbing functions:
/// - File path scrubbing
/// - Email address masking
/// - Token removal
///
/// # Arguments
///
/// * `msg` - The error message to anonymize
///
/// # Returns
///
/// A fully anonymized version of the error message
///
/// # Examples
///
/// ```
/// let error = "API error at /Users/john/app with Bearer abc123 from john@example.com";
/// let safe = anonymize_error_message(error);
/// // Result: "API error at ~/app with [REDACTED] from j***@***.com"
/// ```
pub fn anonymize_error_message(msg: &str) -> String {
    if msg.is_empty() {
        return msg.to_string();
    }

    let mut result = msg.to_string();

    // Apply all scrubbing operations in sequence
    result = scrub_file_path(&result);
    result = scrub_email(&result);
    result = scrub_tokens(&result);

    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_scrub_file_path_macos() {
        let path = "/Users/john/Documents/secret.txt";
        let scrubbed = scrub_file_path(path);
        assert_eq!(scrubbed, "~/Documents/secret.txt");
    }

    #[test]
    fn test_scrub_file_path_linux() {
        let path = "/home/jane/projects/app/src/main.rs";
        let scrubbed = scrub_file_path(path);
        assert_eq!(scrubbed, "~/projects/app/src/main.rs");
    }

    #[test]
    fn test_scrub_file_path_windows_backslash() {
        let path = r"C:\Users\bob\Desktop\file.txt";
        let scrubbed = scrub_file_path(path);
        assert_eq!(scrubbed, r"~\Desktop\file.txt");
    }

    #[test]
    fn test_scrub_file_path_windows_forward_slash() {
        let path = "C:/Users/alice/Documents/data.json";
        let scrubbed = scrub_file_path(path);
        assert_eq!(scrubbed, "~/Documents/data.json");
    }

    #[test]
    fn test_scrub_file_path_empty() {
        let path = "";
        let scrubbed = scrub_file_path(path);
        assert_eq!(scrubbed, "");
    }

    #[test]
    fn test_scrub_file_path_no_home() {
        let path = "/var/log/system.log";
        let scrubbed = scrub_file_path(path);
        assert_eq!(scrubbed, "/var/log/system.log");
    }

    #[test]
    fn test_scrub_email_basic() {
        let text = "Contact user@example.com for help";
        let scrubbed = scrub_email(text);
        assert_eq!(scrubbed, "Contact u***@***.com for help");
    }

    #[test]
    fn test_scrub_email_multiple() {
        let text = "From alice@test.com to bob@demo.org";
        let scrubbed = scrub_email(text);
        assert_eq!(scrubbed, "From a***@***.com to b***@***.org");
    }

    #[test]
    fn test_scrub_email_complex_local() {
        let text = "Email: john.doe+tag@example.co.uk";
        let scrubbed = scrub_email(text);
        assert_eq!(scrubbed, "Email: j***@***.uk");
    }

    #[test]
    fn test_scrub_email_no_email() {
        let text = "No email addresses here";
        let scrubbed = scrub_email(text);
        assert_eq!(scrubbed, "No email addresses here");
    }

    #[test]
    fn test_scrub_bearer_token() {
        let text = "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
        let scrubbed = scrub_tokens(text);
        assert_eq!(scrubbed, "Authorization: [REDACTED]");
    }

    #[test]
    fn test_scrub_oauth_token() {
        let text = "access_token=abc123xyz456def789";
        let scrubbed = scrub_tokens(text);
        assert_eq!(scrubbed, "access_token=[REDACTED]");
    }

    #[test]
    fn test_scrub_jwt_token() {
        let text = "Token: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";
        let scrubbed = scrub_tokens(text);
        assert_eq!(scrubbed, "Token: [REDACTED]");
    }

    #[test]
    fn test_scrub_api_key() {
        // Using fake key format to avoid GitHub secret detection
        let text = "api_key=sk_test_1234567890EXAMPLE";
        let scrubbed = scrub_tokens(text);
        assert_eq!(scrubbed, "api_key=[REDACTED]");
    }

    #[test]
    fn test_scrub_auth_header() {
        let text = "Authorization: Basic dXNlcjpwYXNzd29yZA==";
        let scrubbed = scrub_tokens(text);
        assert_eq!(scrubbed, "Authorization: [REDACTED]");
    }

    #[test]
    fn test_scrub_password() {
        let text = "password=MySuperSecret123!";
        let scrubbed = scrub_tokens(text);
        assert_eq!(scrubbed, "password=[REDACTED]");
    }

    #[test]
    fn test_anonymize_error_message_comprehensive() {
        let error = "Failed to load /Users/john/config.json for john@example.com with Bearer abc123";
        let anonymized = anonymize_error_message(error);

        // Should not contain original username
        assert!(!anonymized.contains("john"));
        assert!(!anonymized.contains("/Users/john"));

        // Should not contain full email
        assert!(!anonymized.contains("john@example.com"));

        // Should not contain bearer token
        assert!(!anonymized.contains("Bearer abc123"));

        // Should contain scrubbed versions
        assert!(anonymized.contains("~"));
        assert!(anonymized.contains("[REDACTED]"));
    }

    #[test]
    fn test_anonymize_error_message_mixed_content() {
        let error = "API call from /home/alice/app failed: token=xyz789 email=alice@test.com password=secret123";
        let anonymized = anonymize_error_message(error);

        assert!(anonymized.contains("~/app"));
        assert!(!anonymized.contains("/home/alice"));
        assert!(!anonymized.contains("alice@test.com"));
        assert!(!anonymized.contains("xyz789"));
        assert!(!anonymized.contains("secret123"));
        assert!(anonymized.contains("[REDACTED]"));
    }

    #[test]
    fn test_anonymize_error_message_empty() {
        let error = "";
        let anonymized = anonymize_error_message(error);
        assert_eq!(anonymized, "");
    }

    #[test]
    fn test_anonymize_error_message_no_sensitive_data() {
        let error = "Connection timeout after 30 seconds";
        let anonymized = anonymize_error_message(error);
        assert_eq!(anonymized, error);
    }

    #[test]
    fn test_scrub_file_path_multiple() {
        let text = "Copy from /Users/john/src.txt to /Users/jane/dst.txt";
        let scrubbed = scrub_file_path(text);
        assert_eq!(scrubbed, "Copy from ~/src.txt to ~/dst.txt");
    }

    #[test]
    fn test_scrub_tokens_multiple_types() {
        let text = "Bearer abc123 and api_key=xyz789 and password=secret";
        let scrubbed = scrub_tokens(text);
        assert!(!scrubbed.contains("abc123"));
        assert!(!scrubbed.contains("xyz789"));
        assert!(!scrubbed.contains("secret"));
        assert_eq!(scrubbed.matches("[REDACTED]").count(), 3);
    }

    #[test]
    fn test_scrub_oauth_token_variations() {
        let variations = vec![
            "oauth_token=abc123",
            "access_token: xyz789",
            r#"refresh_token="def456""#,
        ];

        for var in variations {
            let scrubbed = scrub_tokens(var);
            assert!(scrubbed.contains("[REDACTED]"));
            assert!(!scrubbed.contains("abc123"));
            assert!(!scrubbed.contains("xyz789"));
            assert!(!scrubbed.contains("def456"));
        }
    }

    #[test]
    fn test_should_send_crash_report_default() {
        // Default behavior should be true (for development)
        assert!(should_send_crash_report());
    }

    #[test]
    fn test_real_world_error_stack_trace() {
        let error = r#"
thread 'main' panicked at '/Users/developer/projects/lokus/src/main.rs:42:5':
Failed to connect to database
Connection string: postgres://admin:password123@localhost:5432/lokus
API Key: sk_live_1234567890abcdef
Contact: support@lokus.app for help
        "#;

        let anonymized = anonymize_error_message(error);

        // Check sensitive data is removed
        assert!(!anonymized.contains("/Users/developer"));
        assert!(!anonymized.contains("password123"));
        assert!(!anonymized.contains("sk_live_1234567890abcdef"));
        assert!(!anonymized.contains("support@lokus.app"));

        // Check scrubbed versions are present
        assert!(anonymized.contains("~/projects"));
        assert!(anonymized.contains("[REDACTED]"));
        assert!(anonymized.contains("s***@***.app"));
    }

    #[test]
    fn test_windows_path_case_insensitive() {
        let paths = vec![
            "C:\\Users\\john\\file.txt",
            "c:\\users\\john\\file.txt",
            "C:/Users/john/file.txt",
        ];

        for path in paths {
            let scrubbed = scrub_file_path(path);
            assert!(scrubbed.starts_with("~"));
            assert!(!scrubbed.contains("john"));
        }
    }

    #[test]
    fn test_edge_case_malformed_email() {
        let text = "Invalid email: @example.com and user@";
        let scrubbed = scrub_email(text);
        // Should handle malformed emails gracefully
        assert!(scrubbed.len() > 0);
    }

    #[test]
    fn test_performance_large_text() {
        // Test with a large string to ensure regex performance is acceptable
        let mut large_text = String::new();
        for i in 0..1000 {
            large_text.push_str(&format!(
                "Error {}: file /Users/user{}/file{}.txt with token Bearer token{} from user{}@example.com\n",
                i, i, i, i, i
            ));
        }

        let start = std::time::Instant::now();
        let _anonymized = anonymize_error_message(&large_text);
        let duration = start.elapsed();

        // Should complete in reasonable time (less than 100ms for 1000 entries)
        assert!(duration.as_millis() < 100, "Anonymization took too long: {:?}", duration);
    }
}
