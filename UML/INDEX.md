# Lokus UML Diagrams - Quick Index

## 📊 Generated Diagrams

All diagrams are available in both **SVG** (vector) and **PNG** (raster) formats.

### 1. System Architecture
**File:** `System Architecture - Lokus.svg` / `.png`
**Source:** `01_System_Architecture.puml`

High-level overview showing:
- Frontend layer (React components)
- Backend layer (Rust services)
- IPC communication
- Data storage
- External integrations

---

### 2. Component Diagram
**File:** `Component Diagram - Core System.svg` / `.png`
**Source:** `02_Component_Diagram.puml`

Detailed component relationships showing:
- 63+ UI components
- State management system
- Editor with 24 extensions
- Core logic modules
- Backend Rust modules

**Critical Components Highlighted:**
- `Workspace.jsx` (171KB) - REFACTOR TARGET
- `PluginStateManager` - Fixes "enabled: undefined" bug
- `GraphEngine` - Performance bottleneck
- `search.rs` - Scalability issue

---

### 3. Authentication Flow
**File:** `Authentication Flow - OAuth2 PKCE.svg` / `.png`
**Source:** `03_Sequence_Authentication_Flow.puml`

Complete OAuth2 sequence showing:
- PKCE security flow
- Token exchange
- Secure storage (AES-GCM)
- Session validation
- Token refresh
- Logout process

**Security Features:**
- PKCE prevents code interception
- State parameter prevents CSRF
- OS keychain integration

---

### 4. Plugin System
**File:** `Plugin System - Class Diagram.svg` / `.png`
**Source:** `04_Class_Plugin_System.puml`

Plugin architecture showing:
- PluginManager (lifecycle)
- PluginStateManager (state sync)
- LokusPluginAPI (8 exposed APIs)
- Dependency resolution
- Backend integration

**Critical Issue:**
- Permissions NOT enforced (security vulnerability)

---

### 5. Data Flow Diagram
**File:** `Data Flow Diagram - Lokus.svg` / `.png`
**Source:** `05_Data_Flow_Diagram.puml`

Complete data flow showing:
- User interactions → UI updates
- State management (5 systems)
- IPC communication
- Backend processing
- Data persistence

**Critical Paths:**
1. Document save (500ms debounce)
2. Search (50ms client vs 10s+ backend)
3. Plugin toggle (locking mechanism)

---

### 6. Deployment Architecture
**File:** `Deployment Diagram - Lokus.svg` / `.png`
**Source:** `06_Deployment_Diagram.puml`

Deployment showing:
- Cross-platform distribution (macOS, Windows, Linux)
- Local-first storage
- External services
- Build process
- Resource usage

**Platform Sizes:**
- macOS: 50-70 MB
- Windows: 60-80 MB
- Linux: 70-90 MB

---

## 📄 Analysis Documents

### EXECUTIVE_SUMMARY.md
**Quick overview for leadership**
- Overall grade: B+ (83/100)
- Top 10 critical issues
- Action plan with timeline
- Competitive analysis

### ARCHITECTURE_ANALYSIS.md
**Detailed technical analysis (11,000 words)**
- 10 critical flaws with code examples
- Security assessment
- Performance analysis
- Scalability roadmap
- Technical debt: 6-9 months

---

## 🖼️ Viewing the Diagrams

### Quick View (PNG):
Simply double-click any `.png` file to view in your default image viewer.

### High Quality (SVG):
Open `.svg` files in:
- Web browser (Chrome, Firefox, Safari)
- VS Code (with SVG preview extension)
- Inkscape or Illustrator (for editing)

### Edit Source (PlantUML):
1. Install PlantUML extension in VS Code
2. Open `.puml` files
3. Right-click → "Preview Current Diagram"

---

## 📈 Key Findings Summary

### ✅ Strengths:
- Excellent tech stack (Tauri, React 19, Rust)
- Strong security (OAuth2 PKCE, AES-GCM)
- Well-designed plugin system
- Local-first architecture

### ⚠️ Critical Issues:
1. **State management chaos** (5 systems, race conditions)
2. **File-based storage doesn't scale** (>5K notes unusable)
3. **Monolithic components** (Workspace.jsx: 171KB)
4. **Graph performance** (O(n²), unusable at 500+ nodes)
5. **Plugin security** (permissions not enforced)

### 🎯 Action Required:
- **Immediate:** Fix state management, split components
- **Short-term:** Add search indexing, optimize graph
- **Medium-term:** Plugin security, observability
- **Long-term:** Database migration, sync features

---

## 📊 File Size Reference

| Diagram | SVG | PNG | Complexity |
|---------|-----|-----|------------|
| System Architecture | 74 KB | 224 KB | Medium |
| Component Diagram | 87 KB | 64 KB | High |
| Authentication Flow | 85 KB | 176 KB | Medium |
| Plugin System | 94 KB | 253 KB | High |
| Data Flow | 89 KB | 472 KB | Very High |
| Deployment | 104 KB | 278 KB | High |

**Total:** ~533 KB (SVG) + 1.4 MB (PNG)

---

## 🔍 Quick Navigation

**For Developers:**
1. Start with "System Architecture"
2. Deep dive into "Component Diagram"
3. Understand data flow with "Data Flow Diagram"

**For Security Review:**
1. "Authentication Flow"
2. "Plugin System"
3. Read ARCHITECTURE_ANALYSIS.md (Security section)

**For Performance Analysis:**
1. "Data Flow Diagram" (bottlenecks marked)
2. "Component Diagram" (performance notes)
3. Read ARCHITECTURE_ANALYSIS.md (Performance section)

**For Architecture Planning:**
1. Read EXECUTIVE_SUMMARY.md
2. Review all diagrams
3. Study ARCHITECTURE_ANALYSIS.md
4. Follow action plan timeline

---

**Last Updated:** October 26, 2025
**Codebase Version:** 1.3.3
**Diagrams:** 6 total (SVG + PNG)
**Analysis Documents:** 2 (Executive Summary + Detailed Analysis)
