<div align="center">

<img src="assets/lokus-logo.svg" alt="Lokus Logo" width="120" height="120">

# Lokus

### The Open-Source Note-Taking App for the Modern Developer

**Local-first markdown notes with database views, AI integration, and blazing-fast search.**

Built with React + Rust. Zero vendor lock-in. Your data, your device.

---

[![GitHub Stars](https://img.shields.io/github/stars/lokus-ai/lokus?style=for-the-badge&logo=github&color=yellow)](https://github.com/lokus-ai/lokus/stargazers)
[![GitHub Release](https://img.shields.io/github/v/release/lokus-ai/lokus?style=for-the-badge&logo=github&color=blue)](https://github.com/lokus-ai/lokus/releases)
[![Downloads](https://img.shields.io/github/downloads/lokus-ai/lokus/total?style=for-the-badge&logo=github&color=green)](https://github.com/lokus-ai/lokus/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[![Open Collective](https://img.shields.io/opencollective/all/lokus?style=for-the-badge&logo=opencollective&label=Sponsors)](https://opencollective.com/lokus)
[![Discord](https://img.shields.io/badge/Discord-Join%20Community-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/invite/2rauPDEXcs)
[![Reddit](https://img.shields.io/badge/Reddit-r/LokusMD-FF4500?style=for-the-badge&logo=reddit&logoColor=white)](https://www.reddit.com/r/LokusMD/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](CONTRIBUTING.md)

[Website](https://lokusmd.com) &bull; [Documentation](https://docs.lokusmd.com/) &bull; [Download](https://github.com/lokus-ai/lokus/releases) &bull; [Discord](https://discord.com/invite/2rauPDEXcs) &bull; [Sponsor](https://opencollective.com/lokus)

</div>

---

<div align="center">

### Quick Links

[Download](#-download) &bull; [Features](#-key-features) &bull; [Screenshots](#-screenshots) &bull; [Quick Start](#-quick-start) &bull; [Documentation](#-documentation) &bull; [Contributing](#-contributing) &bull; [Sponsor](#-sponsor)

</div>

---

## Why Lokus?

**Lokus** is a next-generation, local-first note-taking application designed for developers, researchers, and knowledge workers who demand performance, privacy, and powerful features without compromise.

<table>
<tr>
<td width="50%">

### The Problem

- Note-taking apps are slow and bloated
- Cloud-first means your data isn't truly yours
- Powerful features require expensive subscriptions
- Switching between tools is painful

</td>
<td width="50%">

### The Lokus Solution

- **100x faster search** with Quantum architecture
- **100% local-first** - your data never leaves your device
- **All features free** - MIT licensed, forever
- **Obsidian compatible** - use your existing vault

</td>
</tr>
</table>

---

## Comparison

| Feature | Obsidian | Notion | Lokus |
|---------|:--------:|:------:|:-----:|
| **Database Views** | Plugin | Built-in | **Built-in** |
| **3D Knowledge Graph** | No | No | **Yes** |
| **AI Integration** | Plugins | Built-in | **68+ MCP Tools** |
| **Sync** | $10/month | Free (cloud) | **Free (any cloud)** |
| **App Size** | ~100MB | Web-based | **~10MB** |
| **Search Speed** | Standard | Standard | **100x Faster** |
| **Startup Time** | 2-3s | N/A | **<1 second** |
| **Memory Usage** | ~300MB | N/A | **~30MB** |
| **Local-First** | Yes | No | **Yes** |
| **Open Source** | No | No | **MIT License** |
| **Plugin System** | Yes | No | **VS Code-level** |
| **Canvas** | Plugin | No | **Built-in** |

---

## Download

<div align="center">

### Get Lokus for Your Platform

[![Download for macOS](https://img.shields.io/badge/macOS-Download%20.dmg-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/lokus-ai/lokus/releases/latest)
[![Download for Windows](https://img.shields.io/badge/Windows-Download%20.exe-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/lokus-ai/lokus/releases/latest)
[![Download for Linux](https://img.shields.io/badge/Linux-Download%20.AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/lokus-ai/lokus/releases/latest)

**Current Version: v1.3.13** | [All Releases](https://github.com/lokus-ai/lokus/releases) | [Changelog](CHANGELOG.md)

</div>

### Installation

<details>
<summary><b>macOS</b> (Apple Silicon & Intel)</summary>

```bash
# Download the .dmg file from releases
# Open and drag Lokus to Applications
# First launch: Right-click → Open (to bypass Gatekeeper)
```

</details>

<details>
<summary><b>Windows</b> (x64)</summary>

```bash
# Download the .exe installer or .zip portable version
# Run the installer or extract the zip
```

> **Note**: Windows may show a SmartScreen warning initially. The app is open-source and safe.

</details>

<details>
<summary><b>Linux</b> (AppImage)</summary>

```bash
wget https://github.com/lokus-ai/lokus/releases/latest/download/lokus.AppImage
chmod +x lokus.AppImage
./lokus.AppImage
```

</details>

---

## Key Features

<details open>
<summary><b>Rich Markdown Editor</b> - Powered by TipTap</summary>

<br>

The most capable markdown editor in any note-taking app:

- **Full Markdown Support** - CommonMark + GFM extensions
- **LaTeX Math** - Inline `$x^2$` and block `$$E=mc^2$$` with KaTeX
- **Wiki Links** - `[[Note Name]]` with autocomplete and preview
- **100+ Languages** - Syntax highlighting with line numbers
- **Tables** - Resizable columns, sorting, Excel paste support
- **Task Lists** - Multiple status states and progress tracking
- **Images** - Lazy loading, auto-compression, local & web
- **Smart Paste** - HTML automatically converts to Markdown
- **Split Pane** - Side-by-side editing with `Cmd/Ctrl + \`
- **Vim Mode** - Full Vi/Vim keybindings (optional)
- **Callouts** - Info, warning, danger blocks
- **Mermaid Diagrams** - Flowcharts, sequence diagrams, and more

</details>

<details>
<summary><b>Database Views (Bases)</b> - Like Notion, Built-in</summary>

<br>

Transform your markdown files into powerful databases:

- **8 Property Types** - Text, Number, Date, Select, Multi-select, Checkbox, URL, Email
- **YAML Frontmatter** - Automatic property extraction
- **Inline Editing** - Click any cell to edit directly
- **Advanced Filtering** - AND/OR logic with 15+ operators
- **Sorting & Grouping** - Multi-column support
- **Multiple Views** - Different views for the same data
- **Quantum Search** - Lightning-fast database queries

```yaml
---
title: Project Alpha
status: In Progress
priority: High
due_date: 2025-12-31
tags: [development, urgent]
---
```

</details>

<details>
<summary><b>Knowledge Graph</b> - Interactive 2D/3D Visualization</summary>

<br>

See the connections between your ideas:

- **2D & 3D Views** - Toggle between visualization modes
- **Interactive Navigation** - Click nodes to open notes
- **Community Detection** - Automatic clustering of related notes
- **Force-Directed Layout** - Physics-based node positioning
- **Filter by Tags/Paths** - Custom graph queries
- **Export** - PNG/SVG for presentations
- **Scales to 10,000+ Notes** - Sub-100ms rendering

</details>

<details>
<summary><b>AI Integration (MCP Server)</b> - 68+ Built-in Tools</summary>

<br>

The most comprehensive AI integration in any note-taking app:

| Category | Tools | Description |
|----------|-------|-------------|
| **Note Management** | 11 | Create, read, update, delete, organize |
| **Workspace Operations** | 12 | File management, folder operations |
| **Advanced Search** | 16 | Quantum search, semantic queries |
| **AI Analysis** | 10 | Content analysis, suggestions, summaries |
| **File Operations** | 6 | Move, rename, bulk operations |
| **Editor Enhancements** | 10 | Format, validate, transform |

- **Auto-starts with Lokus** - Zero configuration needed
- **Model Context Protocol** - Connect any AI assistant
- **Local-first** - Your data never leaves your device

</details>

<details>
<summary><b>Quantum Search</b> - 100x Faster Than Alternatives</summary>

<br>

Revolutionary search architecture:

| Metric | Traditional | Lokus Quantum |
|--------|-------------|---------------|
| **10,000 files** | 2,400ms | **22ms** |
| **Memory** | 100% | **10%** |
| **Latency** | Standard | **Sub-millisecond** |

- **O(1) Lookups** - Constant-time query performance
- **Neural Semantic Cache** - Predictive search results
- **Full-text + Metadata** - Search everything at once
- **Regex Support** - Advanced pattern matching
- **Boolean Queries** - AND/OR/NOT operators

</details>

<details>
<summary><b>Canvas & Visualization</b> - TLDraw Powered</summary>

<br>

Infinite canvas for spatial thinking:

- **Freeform Drawing** - Shapes, text, connectors
- **Embed Notes** - Link notes directly on canvas
- **Image Support** - Drag & drop images
- **Kanban Boards** - Visual task management
- **File Persistence** - `.canvas` file format
- **Export** - PNG, SVG for sharing

</details>

<details>
<summary><b>More Features</b></summary>

<br>

- **Template System** - 90+ features including date math, filters, conditionals, loops
- **Plugin System** - VS Code-level extensibility with SDK
- **Gmail Integration** - OAuth 2.0, import emails as notes
- **Theme System** - Dark/light mode with custom themes
- **Command Palette** - `Cmd/Ctrl + K` for everything
- **Global Shortcuts** - System-wide hotkeys
- **Git Integration** - Version control built-in
- **File Watcher** - Auto-reload on external changes
- **Crash Reporting** - Self-hosted Sentry integration

</details>

---

## Screenshots

<div align="center">

### Rich Markdown Editor
<img src="assets/screenshots/screenshot-1.png" alt="Rich Markdown Editor" width="800">

### 3D Knowledge Graph
<img src="assets/screenshots/screenshot-2.png" alt="3D Knowledge Graph" width="800">

### Database Views (Bases)
<img src="assets/screenshots/screenshot-3.png" alt="Database Views" width="800">

### Interactive Navigation
<img src="assets/screenshots/screenshot-4.png" alt="Interactive Navigation" width="800">

</div>

---

## Quick Start

### For Users

1. **Download** Lokus from the [releases page](https://github.com/lokus-ai/lokus/releases)
2. **Install** and launch the application
3. **Select or create** a workspace (compatible with Obsidian vaults!)
4. **Start writing** with the most powerful markdown editor available

### For Developers

**Option 1: Dev Container (Recommended)**

```bash
# Prerequisites: Docker + VS Code + Dev Containers extension
git clone https://github.com/lokus-ai/lokus.git
cd lokus
code .
# Click "Reopen in Container" - everything installs automatically!
```

**Option 2: Manual Setup**

```bash
# Prerequisites: Node.js 18+, Rust (rustup)
git clone https://github.com/lokus-ai/lokus.git
cd lokus
npm install

# Development
npm run tauri dev

# Build
npm run tauri build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for complete setup instructions.

---

## Tech Stack

<div align="center">

| Layer | Technology |
|:-----:|:----------:|
| **Frontend** | ![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black) ![TipTap](https://img.shields.io/badge/TipTap_3.4-000000?style=flat) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) ![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=flat&logo=vite&logoColor=white) |
| **Backend** | ![Rust](https://img.shields.io/badge/Rust-000000?style=flat&logo=rust&logoColor=white) ![Tauri](https://img.shields.io/badge/Tauri_2.0-24C8DB?style=flat&logo=tauri&logoColor=white) ![Tokio](https://img.shields.io/badge/Tokio-000000?style=flat) |
| **Visualization** | ![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat&logo=three.js&logoColor=white) ![TLDraw](https://img.shields.io/badge/TLDraw_3-000000?style=flat) ![Sigma.js](https://img.shields.io/badge/Sigma.js-000000?style=flat) |
| **Storage** | ![JSON](https://img.shields.io/badge/JSON-000000?style=flat&logo=json&logoColor=white) Local-first + SQLite (optional) |
| **Testing** | ![Vitest](https://img.shields.io/badge/Vitest-729B1B?style=flat&logo=vitest&logoColor=white) ![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat&logo=playwright&logoColor=white) 500+ tests |

</div>

### Architecture Highlights

- **47,800+ lines** of React/JavaScript frontend code
- **5,700+ lines** of Rust backend code
- **130+ React components**
- **68+ MCP tools** for AI integration
- **500+ automated tests** (unit + E2E)
- **40+ documentation files**

---

## Documentation

<div align="center">

[![Documentation](https://img.shields.io/badge/Read%20the%20Docs-docs.lokusmd.com-blue?style=for-the-badge)](https://docs.lokusmd.com/)

</div>

### Quick Links

| Topic | Description |
|-------|-------------|
| [User Guide](https://docs.lokusmd.com/) | Complete user documentation |
| [Getting Started](https://docs.lokusmd.com/) | First steps with Lokus |
| [Editor Features](docs/features/editor.md) | Markdown editor capabilities |
| [Database Views](docs/features/BASES_COMPLETE_GUIDE.md) | Using Bases (databases) |
| [Graph View](docs/features/graph-view.md) | Knowledge graph visualization |
| [Templates](docs/templates/README.md) | Template system guide |
| [MCP Integration](docs/MCP_INTEGRATION_GUIDE.md) | AI tools and MCP server |
| [Plugin Development](docs/PLUGIN_DEVELOPMENT.md) | Building plugins |
| [Build Guide](docs/BUILD_GUIDE.md) | Building from source |

---

## Contributing

We welcome contributions from everyone! Lokus is built by the community, for the community.

<div align="center">

[![Good First Issues](https://img.shields.io/github/issues/lokus-ai/lokus/good%20first%20issue?label=Good%20First%20Issues&color=7057ff&style=for-the-badge)](https://github.com/lokus-ai/lokus/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
[![Help Wanted](https://img.shields.io/github/issues/lokus-ai/lokus/help%20wanted?label=Help%20Wanted&color=008672&style=for-the-badge)](https://github.com/lokus-ai/lokus/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)

</div>

### Ways to Contribute

| | Type | How to Help |
|:-:|------|-------------|
| **Bug Reports** | Found a bug? Help us fix it by [opening an issue](https://github.com/lokus-ai/lokus/issues/new?template=bug_report.yml) |
| **Feature Requests** | Have an idea? [Suggest a feature](https://github.com/lokus-ai/lokus/issues/new?template=feature_request.yml) |
| **Code** | Submit PRs for bugs, features, or optimizations |
| **Documentation** | Improve guides, fix typos, add examples |
| **Themes** | Create and share custom themes |
| **Plugins** | Build plugins with our [SDK](packages/plugin-sdk/) |
| **Translations** | Help localize Lokus (coming soon) |

### Quick Contribution Guide

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/lokus.git
cd lokus

# 2. Create a branch
git checkout -b feature/your-feature-name

# 3. Make changes and test
npm install
npm test
npm run tauri dev

# 4. Submit a PR
git push origin feature/your-feature-name
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for complete guidelines, coding standards, and development setup.

---

## Sponsor

Lokus is **100% free and open source**, built by passionate developers who believe in local-first, privacy-respecting software.

Your sponsorship directly funds:

- **Faster development** of new features
- **Mobile apps** (iOS & Android - Q1 2026)
- **Better documentation** and tutorials
- **Infrastructure costs** (crash reporting, website, releases)
- **Accessibility improvements**
- **Long-term maintenance**

<div align="center">

[![Sponsor on Open Collective](https://img.shields.io/badge/Sponsor%20Us-Open%20Collective-7FADF2?style=for-the-badge&logo=opencollective&logoColor=white)](https://opencollective.com/lokus)

### [Become a Sponsor](https://opencollective.com/lokus)

**100% transparent** - Every expense is publicly visible on Open Collective.

</div>

### Sponsors

<a href="https://opencollective.com/lokus#sponsors" target="_blank"><img src="https://opencollective.com/lokus/sponsors.svg?width=890&button=false" alt="Sponsors"></a>

### Backers

<a href="https://opencollective.com/lokus#backers" target="_blank"><img src="https://opencollective.com/lokus/backers.svg?width=890&button=false" alt="Backers"></a>

---

## Community

<div align="center">

[![Discord](https://img.shields.io/badge/Discord-Join%20Server-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/invite/2rauPDEXcs)
[![Reddit](https://img.shields.io/badge/Reddit-r/LokusMD-FF4500?style=for-the-badge&logo=reddit&logoColor=white)](https://www.reddit.com/r/LokusMD/)
[![GitHub Discussions](https://img.shields.io/badge/GitHub-Discussions-181717?style=for-the-badge&logo=github)](https://github.com/lokus-ai/lokus/discussions)

</div>

| Channel | Purpose |
|---------|---------|
| [Discord](https://discord.com/invite/2rauPDEXcs) | Real-time chat, support, community |
| [Reddit](https://www.reddit.com/r/LokusMD/) | Share workflows, tips, discussions |
| [GitHub Discussions](https://github.com/lokus-ai/lokus/discussions) | Q&A, feature requests, announcements |
| [GitHub Issues](https://github.com/lokus-ai/lokus/issues) | Bug reports, feature tracking |

---

## Roadmap

### v1.3 "Quantum Leap" (Current)

- [x] Database views (Bases)
- [x] MCP Server with 68+ AI tools
- [x] Quantum Search architecture
- [x] Full Windows support
- [x] Plugin System v2
- [x] Gmail Integration
- [x] 3D Knowledge Graph

### v1.4 (Next)

- [ ] Mobile apps (iOS & Android)
- [ ] Calendar view for Bases
- [ ] Formula support (spreadsheet-like)
- [ ] PDF annotations
- [ ] Web clipper extension
- [ ] E2E encryption (optional)

### v1.5 (Future)

- [ ] Obsidian plugin compatibility layer
- [ ] Multi-vault support
- [ ] AI writing assistant
- [ ] Export to PDF/DOCX with formatting
- [ ] Workflow automation

[Vote on features](https://github.com/lokus-ai/lokus/discussions/categories/roadmap) | [View full roadmap](https://github.com/lokus-ai/lokus/projects)

---

## FAQ

<details>
<summary><b>Is Lokus compatible with Obsidian?</b></summary>

**Yes!** Lokus uses standard markdown files. Point it at your Obsidian vault and everything works - notes, wiki links, attachments. No migration needed.

</details>

<details>
<summary><b>Is sync really free?</b></summary>

**Yes!** Use any cloud provider you want - Dropbox, Google Drive, iCloud, Syncthing, OneDrive. Your files are standard markdown, so any sync solution works. No vendor lock-in.

</details>

<details>
<summary><b>Can I use Lokus offline?</b></summary>

**100% yes!** Lokus is local-first. Internet is only needed for Gmail integration and optional cloud features. All core functionality works completely offline.

</details>

<details>
<summary><b>What about my privacy?</b></summary>

Your data never leaves your device. **No telemetry, no tracking, no analytics.** The app is open-source - you can verify this yourself. Optional cloud features (Gmail) use industry-standard OAuth 2.0.

</details>

<details>
<summary><b>When are mobile apps coming?</b></summary>

Mobile apps for iOS and Android are planned for 2026, built using Tauri Mobile. [Track progress in discussions](https://github.com/lokus-ai/lokus/discussions).

</details>

<details>
<summary><b>How do I report bugs or request features?</b></summary>

- **Bugs**: [Open a bug report](https://github.com/lokus-ai/lokus/issues/new?template=bug_report.yml)
- **Features**: [Request a feature](https://github.com/lokus-ai/lokus/issues/new?template=feature_request.yml)
- **Questions**: [Start a discussion](https://github.com/lokus-ai/lokus/discussions)
- **Chat**: [Join our Discord](https://discord.com/invite/2rauPDEXcs)

</details>

<details>
<summary><b>How can I contribute?</b></summary>

We welcome all contributions! Check out our [Contributing Guide](CONTRIBUTING.md) for setup instructions. Look for issues labeled [`good first issue`](https://github.com/lokus-ai/lokus/labels/good%20first%20issue) if you're new.

</details>

---

## License

Lokus is licensed under the [MIT License](LICENSE).

```
MIT License

Copyright (c) 2024 CodeWithInferno

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## Acknowledgments

Lokus stands on the shoulders of giants:

- [Obsidian](https://obsidian.md) - Pioneering local-first knowledge management
- [Notion](https://notion.so) - Inspiring database views and UX patterns
- [TipTap](https://tiptap.dev) - The foundation of our amazing editor
- [Tauri](https://tauri.app) - Enabling lightweight, secure desktop apps
- [TLDraw](https://tldraw.com) - Powering our infinite canvas
- [Rust](https://rust-lang.org) - Performance and safety at the core

Special thanks to all our [contributors](https://github.com/lokus-ai/lokus/graphs/contributors) and the open-source community!

---

<div align="center">

### Star History

[![Star History Chart](https://api.star-history.com/svg?repos=lokus-ai/lokus&type=Date)](https://star-history.com/#lokus-ai/lokus&Date)

---

**Built with care by the Lokus team and contributors worldwide**

[Website](https://lokusmd.com) &bull; [Documentation](https://docs.lokusmd.com/) &bull; [Discord](https://discord.com/invite/2rauPDEXcs) &bull; [Reddit](https://www.reddit.com/r/LokusMD/) &bull; [Sponsor](https://opencollective.com/lokus)

---

**If you find Lokus useful, please consider starring the repository!**

**It helps others discover the project and motivates continued development.**

[![Star on GitHub](https://img.shields.io/github/stars/lokus-ai/lokus?style=social)](https://github.com/lokus-ai/lokus)

</div>
