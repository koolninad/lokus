// Tauri + Browser-safe config store
let isTauri = false;
try {
  const w = typeof window !== 'undefined' ? window : undefined;
  isTauri = !!(
    w && (
      (w.__TAURI_INTERNALS__ && typeof w.__TAURI_INTERNALS__.invoke === 'function') ||
      w.__TAURI_METADATA__ ||
      (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.includes('Tauri'))
    )
  );
} catch {}

let appDataDir, join, readTextFile, writeTextFile, mkdir, exists;
if (isTauri) {
  try {
    ({ appDataDir, join } = await import("@tauri-apps/api/path"));
    ({ readTextFile, writeTextFile, mkdir, exists } = await import("@tauri-apps/plugin-fs"));
  } catch (e) {
    isTauri = false;
  }
}

const APP_DIR = "Lokus";
const GLOBAL_CONFIG = "config.json";
const BROWSER_KEY = "lokus:config";

// Default privacy settings
// Applied when config doesn't have privacy key or for missing fields
const DEFAULT_PRIVACY_SETTINGS = {
  // crashReporting: User can opt-out in preferences, but enabled by default
  // This helps us improve Lokus by understanding what went wrong
  crashReporting: true,

  // anonymizePaths: Always scrub file paths from crash reports
  // Protects your file structure and directory names
  anonymizePaths: true,

  // anonymizeEmails: Always scrub email addresses from crash reports
  // Protects your personal information and contacts
  anonymizeEmails: true,

  // sharePerformanceData: Don't share performance metrics by default
  // User can opt-in later if they want to help improve performance
  sharePerformanceData: false
};

/**
 * Validates and normalizes privacy settings
 * Ensures all boolean values are valid and applies defaults for missing fields
 */
function validatePrivacySettings(privacy) {
  if (!privacy || typeof privacy !== 'object') {
    return { ...DEFAULT_PRIVACY_SETTINGS };
  }

  const validated = {};

  // Validate each field, falling back to defaults if invalid
  for (const [key, defaultValue] of Object.entries(DEFAULT_PRIVACY_SETTINGS)) {
    const value = privacy[key];
    // Only accept boolean values, use default for anything else
    validated[key] = typeof value === 'boolean' ? value : defaultValue;
  }

  return validated;
}

/**
 * Ensures config has privacy settings with proper defaults
 * Applies migration for existing configs without privacy key
 */
function ensurePrivacyDefaults(config) {
  if (!config || typeof config !== 'object') {
    return config;
  }

  // If no privacy key exists, add defaults (migration)
  if (!config.privacy) {
    return {
      ...config,
      privacy: { ...DEFAULT_PRIVACY_SETTINGS }
    };
  }

  // Validate and normalize existing privacy settings
  return {
    ...config,
    privacy: validatePrivacySettings(config.privacy)
  };
}

async function ensureDir(p) { if (!isTauri) return; if (!(await exists(p))) await mkdir(p, { recursive: true }); }
async function readJson(p) {
  if (!isTauri) {
    try { return JSON.parse(localStorage.getItem(BROWSER_KEY) || "null"); } catch { return null; }
  }
  try { return JSON.parse(await readTextFile(p)); } catch { return null; }
}
async function writeJson(p, data) {
  if (!isTauri) { localStorage.setItem(BROWSER_KEY, JSON.stringify(data ?? {})); return; }
  await writeTextFile(p, JSON.stringify(data, null, 2));
}

export async function getGlobalDir() {
  if (!isTauri) return APP_DIR;
  const d = await join(await appDataDir(), APP_DIR);
  await ensureDir(d);
  return d;
}

export async function getGlobalConfigPath() {
  if (!isTauri) return GLOBAL_CONFIG;
  return await join(await getGlobalDir(), GLOBAL_CONFIG);
}

export async function readConfig() {
  const configPath = await getGlobalConfigPath();

  // Ensure directory exists before reading
  if (isTauri) {
    const dir = await getGlobalDir();
    await ensureDir(dir);
  }

  let result = await readJson(configPath);

  // If config file doesn't exist or failed to read, initialize with empty config
  if (result === null) {
    result = {};
    // Don't save empty config - let it be created when user actually changes settings
  }

  // Apply privacy defaults for backward compatibility
  // This ensures existing users without privacy settings get the defaults
  result = ensurePrivacyDefaults(result);

  return result;
}

export async function writeConfig(next) {
  const configPath = await getGlobalConfigPath();

  // Ensure directory exists before writing
  if (isTauri) {
    const dir = await getGlobalDir();
    await ensureDir(dir);
  }

  // Validate privacy settings if they exist in the config being written
  let validatedConfig = next;
  if (next && next.privacy) {
    validatedConfig = {
      ...next,
      privacy: validatePrivacySettings(next.privacy)
    };
  }

  const result = await writeJson(configPath, validatedConfig);
  return result;
}

export async function updateConfig(patch) {
  const cur = await readConfig();

  // Handle privacy settings specially - merge instead of replace
  let next = { ...cur, ...patch };
  if (patch && patch.privacy && cur.privacy) {
    next = {
      ...cur,
      ...patch,
      privacy: { ...cur.privacy, ...patch.privacy }
    };
  }

  await writeConfig(next);
  return next;
}