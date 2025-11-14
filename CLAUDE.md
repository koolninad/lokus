# Claude Development Guide for Lokus

## 🚀 **Quick Start Commands**

### **Development**
```bash
npm run tauri dev
```

### **Build**
```bash
npm run tauri build
```

### **Testing**
```bash
# Unit tests
npm test
npm run test:watch

# E2E tests
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:headed
```

## 📁 **Project Structure**

### **Frontend (React + TipTap)**
- `src/editor/` - Rich text editor components
- `src/views/` - Main app views (Workspace, Preferences)
- `src/core/` - Core functionality (themes, config, wiki, **templates**)
  - `src/core/templates/` - Template system implementation
    - `file-storage.js` - File-based template storage
    - `processor-integrated.js` - Main template processor
    - `dates.js` - Date operations (70+ functions)
    - `filters.js` - Text/array/number filters (60+)
    - `conditionals.js` - If/else logic
    - `loops.js` - Array iteration
    - `sandbox-isolated.js` - JavaScript execution
    - `html-to-markdown.js` - HTML conversion
- `src/hooks/` - React hooks
  - `useTemplates.js` - Template management hook
- `src/components/` - React components
  - `CreateTemplate.jsx` - Template creation UI
- `src/styles/` - CSS and styling

### **Backend (Tauri + Rust)**
- `src-tauri/src/main.rs` - Main Tauri backend
- `src-tauri/src/` - Rust modules

## 🛡️ **Crash Reporting & Privacy**

### **Self-Hosted Crash Reporting** (GlitchTip)

- ✅ **Opt-in by default** - Users choose to help improve the app
- ✅ **Self-hosted infrastructure** - Complete control over data
- ✅ **Zero cost** - Runs on personal hardware
- ✅ **Privacy-first design** - All PII scrubbed before transmission

### **Privacy Features**

- ✅ **File path anonymization** - `/Users/john/` → `~/`
- ✅ **Email masking** - `user@domain.com` → `u***@***.com`
- ✅ **Token redaction** - Bearer tokens, API keys, passwords removed
- ✅ **Breadcrumb filtering** - No note content or sensitive data
- ✅ **User control** - Easy opt-out in Preferences UI

### **Technical Stack**

- ✅ **Backend**: Sentry SDK for Rust (src-tauri/src/main.rs:218-282)
- ✅ **Frontend**: @sentry/react integration (src/main.jsx)
- ✅ **Privacy modules**:
  - Rust: src-tauri/src/privacy.rs (28 unit tests)
  - JavaScript: src/utils/privacy.js (comprehensive filtering)
- ✅ **Infrastructure**: Docker Compose + GlitchTip + PostgreSQL + Redis
- ✅ **Access**: Cloudflare Tunnel (secure, no port forwarding)
- ✅ **Source maps**: Automated upload via Sentry Vite plugin

### **Files & Directories**

- `src-tauri/src/privacy.rs` - Rust PII scrubbing module
- `src/utils/privacy.js` - JavaScript privacy utilities
- `src/components/ErrorBoundary.jsx` - User-friendly error UI
- `src/views/Preferences.jsx` - Privacy settings UI
- `infrastructure/` - GlitchTip deployment (Docker Compose)
- `infrastructure/README.md` - Complete deployment guide
- `docs/privacy.md` - User-facing privacy policy
- `tests/unit/privacy.test.js` - 28 passing privacy tests
- `tests/CRASH_REPORTING_TEST_PLAN.md` - Manual testing checklist

### **Environment Variables**

```bash
# Crash Reporting DSNs
VITE_SENTRY_DSN=https://key@crash.lokusmd.com/api/project/store/
TAURI_SENTRY_DSN=https://key@crash.lokusmd.com/api/project/store/

# Environment
VITE_SENTRY_ENVIRONMENT=development|test|production

# Enable/Disable
VITE_ENABLE_CRASH_REPORTS=true|false

# Source Maps (build only)
SENTRY_ORG=lokus
SENTRY_PROJECT=lokus-app
SENTRY_AUTH_TOKEN=your_token_here
```

### **How to Deploy GlitchTip**

```bash
cd infrastructure
cp .env.example .env
# Edit .env with your values
docker-compose up -d
docker-compose exec glitchtip ./manage.py createsuperuser
# Access at http://localhost:8000
```

See `infrastructure/README.md` for complete instructions.

## ✨ **Key Features Implemented**

### **Editor Features**
- ✅ Rich text editing with TipTap
- ✅ Markdown support (all standard features)
- ✅ Math equations (KaTeX) - inline `$x^2$` and block `$$E=mc^2$$`
- ✅ Wiki links `[[page]]` with autocomplete
- ✅ Task lists with checkboxes
- ✅ Tables with resizing
- ✅ Code blocks with syntax highlighting
- ✅ Images (local and web URLs)
- ✅ Strikethrough `~~text~~`
- ✅ Highlights `==text==`
- ✅ Superscript `H^2^O` and subscript `H~2~O`
- ✅ Smart paste (markdown → rich text)

### **App Features**
- ✅ File management and workspace
- ✅ Theme system (light/dark + custom themes)
- ✅ Preferences with real-time editor customization
- ✅ Daily Notes system with date navigation
- ✅ Advanced template system with 90+ features
  - File-based storage (.md files with YAML frontmatter)
  - 70+ date operations with method chaining
  - 60+ text/array/number/date filters
  - Conditionals (if/else/elseif) with operators
  - Loops (#each) with special variables
  - JavaScript sandbox execution
  - Template includes for composition
  - HTML to Markdown auto-conversion
  - Duplicate detection and overwrite protection

## 🔧 **Common Tasks**

### **Adding New Editor Features**
1. Create extension in `src/editor/extensions/`
2. Import and add to extensions array in `Editor.jsx`
3. Add slash command in `slash-command.jsx`
4. Update CSS in `editor.css`

### **Adding New Views**
1. Create component in `src/views/`
2. Import and route in `App.jsx`
3. Add navigation if needed

### **Modifying Themes**
- Edit `src/core/theme/manager.js`
- CSS variables in `src/styles/globals.css`

### **Working with Templates**
- **Documentation**: See `docs/templates/` for complete guides
  - `README.md` - Overview and quick start
  - `syntax-reference.md` - Complete syntax guide
  - `examples.md` - Real-world examples
  - `architecture.md` - Technical implementation
- **Storage Location**: `/Users/[username]/Desktop/My Knowledge Base/templates/`
- **File Format**: Markdown with YAML frontmatter
- **Testing**: Unit tests in `tests/unit/templates/`
- **Key Files**:
  - Template processing: `src/core/templates/processor-integrated.js`
  - Storage: `src/core/templates/file-storage.js`
  - UI: `src/components/CreateTemplate.jsx`

## 🐛 **Known Issues**

### **Fixed**
- ✅ Math rendering (KaTeX integration)
- ✅ WikiLink autocomplete conflicts with regular links
- ✅ Paste functionality blocking all operations
- ✅ Link colors not blue
- ✅ Brackets in lists triggering wiki suggestions

### **Current Issues**
- Need better file organization

## 📝 **Development Notes**

### **Code Style**
- React functional components with hooks
- TipTap extensions for editor functionality
- Tauri commands for file operations
- CSS custom properties for theming

### **Testing Strategy**
- **Unit tests** (`tests/unit/`) - Core functions and utilities
- **E2E tests** (`tests/e2e/`) - Complete user workflows
  - App navigation and preferences
  - Editor functionality (formatting, math, tables)
  - File operations and saving
  - Math rendering and slash commands
- **CI/CD** - GitHub Actions for automated testing
- **Manual testing** - Complex editor interactions

### **Performance Considerations**
- Lazy loading for large documents
- Debounced save operations
- Efficient re-renders with React.memo

---

*Last Updated: September 12, 2025*
*Status: Ready for SaaS development phase*



Never Mention Claude in anything no pr no issue no commits no comments never mention claude