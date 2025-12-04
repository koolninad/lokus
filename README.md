<div align="center">

<img src="assets/lokus-logo.svg" alt="Lokus Logo" width="120" height="120">

# Lokus

### A Modern, Local-First Markdown Note-Taking App

**Database views, knowledge graphs, AI integration, and a powerful editor.**

Built with React + Rust. Open source. Your data stays on your device.

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

## What is Lokus?

Lokus is an open-source, local-first note-taking application for developers, researchers, and anyone who wants to organize their knowledge. All your data stays on your device - no cloud required, no subscription needed.

### Key Highlights

- **Local-first** - Your notes are stored as plain markdown files on your computer
- **Database views** - Turn your notes into Notion-style databases with filtering and sorting
- **Knowledge graph** - Visualize connections between your notes in 2D or 3D
- **AI integration** - Built-in MCP server with 68+ tools for AI assistants
- **Rich editor** - TipTap-powered editor with math, code blocks, tables, and more
- **Obsidian compatible** - Works with your existing Obsidian vault
- **Cross-platform** - Windows, macOS, and Linux
- **Free forever** - MIT licensed, no subscription

---

## Download

<div align="center">

[![Download for macOS](https://img.shields.io/badge/macOS-Download-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/lokus-ai/lokus/releases/latest)
[![Download for Windows](https://img.shields.io/badge/Windows-Download-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/lokus-ai/lokus/releases/latest)
[![Download for Linux](https://img.shields.io/badge/Linux-Download-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/lokus-ai/lokus/releases/latest)

**Current Version: v1.3.13** | [All Releases](https://github.com/lokus-ai/lokus/releases) | [Changelog](CHANGELOG.md)

</div>

### Installation

**macOS** (Apple Silicon & Intel)
```bash
# Download .dmg from releases, open it, drag Lokus to Applications
# First launch: Right-click → Open (to bypass Gatekeeper)
```

**Windows** (x64)
```bash
# Download .exe installer or .zip portable version
```

> **Note**: Windows may show a SmartScreen warning initially. The app is open-source and safe.

**Linux** (AppImage)
```bash
wget https://github.com/lokus-ai/lokus/releases/latest/download/lokus.AppImage
chmod +x lokus.AppImage
./lokus.AppImage
```

---

## Features

### Rich Markdown Editor

Built on TipTap, our editor supports:

- Full markdown syntax (CommonMark + GFM)
- LaTeX math equations - inline `$x^2$` and block `$$E=mc^2$$`
- Wiki links - `[[Note Name]]` with autocomplete
- Syntax highlighting for 100+ languages
- Resizable tables with sorting
- Task lists with checkboxes
- Images (local and web)
- Mermaid diagrams
- Callout blocks
- Vim mode (optional)

### Database Views (Bases)

Transform your markdown files into databases:

- **8 property types** - Text, Number, Date, Select, Multi-select, Checkbox, URL, Email
- **YAML frontmatter** - Properties are extracted automatically
- **Filtering** - AND/OR logic with multiple operators
- **Sorting & grouping** - Organize your data how you want
- **Inline editing** - Click cells to edit directly

```yaml
---
title: My Project
status: In Progress
priority: High
due_date: 2025-12-31
tags: [development, urgent]
---
```

### Knowledge Graph

Visualize the connections between your notes:

- 2D and 3D visualization modes
- Click nodes to navigate
- Filter by tags or folders
- Community detection for clustering
- Export as PNG/SVG

### AI Integration (MCP Server)

Built-in Model Context Protocol server with 68+ tools:

| Category | Tools |
|----------|-------|
| Note Management | 11 tools - create, read, update, delete |
| Workspace Operations | 12 tools - file management |
| Search | 16 tools - find content across notes |
| Analysis | 10 tools - content analysis |
| File Operations | 6 tools - move, rename, organize |
| Editor | 10 tools - formatting, validation |

The MCP server auto-starts with Lokus - connect any AI assistant that supports MCP.

### Canvas

Infinite canvas powered by TLDraw:

- Freeform drawing with shapes and text
- Embed notes on the canvas
- Kanban boards for task management
- Export as PNG/SVG

### More Features

- **Templates** - Create note templates with variables and logic
- **Plugin system** - Extend functionality with plugins
- **Gmail integration** - Import emails as notes (OAuth 2.0)
- **Theme system** - Dark/light mode with custom themes
- **Command palette** - Quick access with `Cmd/Ctrl + K`
- **Global shortcuts** - System-wide hotkeys
- **Git integration** - Built-in version control
- **File watcher** - Auto-reload when files change externally

---

## Screenshots

<div align="center">

### Editor
<img src="assets/screenshots/screenshot-1.png" alt="Rich Markdown Editor" width="800">

### Knowledge Graph
<img src="assets/screenshots/screenshot-2.png" alt="Knowledge Graph" width="800">

### Database Views
<img src="assets/screenshots/screenshot-3.png" alt="Database Views" width="800">

### Navigation
<img src="assets/screenshots/screenshot-4.png" alt="Navigation" width="800">

</div>

---

## Quick Start

### For Users

1. Download Lokus from the [releases page](https://github.com/lokus-ai/lokus/releases)
2. Install and launch
3. Select or create a workspace (works with Obsidian vaults)
4. Start writing

### For Developers

**Using Dev Container (Recommended)**

```bash
# Prerequisites: Docker + VS Code + Dev Containers extension
git clone https://github.com/lokus-ai/lokus.git
cd lokus
code .
# Click "Reopen in Container" - everything installs automatically
```

**Manual Setup**

```bash
# Prerequisites: Node.js 18+, Rust (rustup)
git clone https://github.com/lokus-ai/lokus.git
cd lokus
npm install

# Development
npm run tauri dev

# Build
npm run tauri build

# Tests
npm test           # Unit tests
npm run test:e2e   # E2E tests
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed setup instructions.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TipTap 3.4, Tailwind CSS, Vite 7 |
| Backend | Rust, Tauri 2.0, Tokio |
| Visualization | Three.js, Sigma.js, TLDraw 3 |
| Storage | Local JSON/Markdown files |
| Testing | Vitest, Playwright |

---

## Documentation

- [User Guide](https://docs.lokusmd.com/)
- [Editor Features](docs/features/editor.md)
- [Database Views Guide](docs/features/BASES_COMPLETE_GUIDE.md)
- [Graph View](docs/features/graph-view.md)
- [Templates](docs/templates/README.md)
- [MCP Integration](docs/MCP_INTEGRATION_GUIDE.md)
- [Plugin Development](docs/PLUGIN_DEVELOPMENT.md)
- [Build Guide](docs/BUILD_GUIDE.md)

---

## Contributing

We welcome contributions! Whether you're fixing bugs, adding features, improving docs, or creating themes and plugins.

<div align="center">

[![Good First Issues](https://img.shields.io/github/issues/lokus-ai/lokus/good%20first%20issue?label=Good%20First%20Issues&color=7057ff&style=for-the-badge)](https://github.com/lokus-ai/lokus/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)

</div>

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/lokus.git

# 2. Create a branch
git checkout -b feature/your-feature

# 3. Make changes and test
npm test
npm run tauri dev

# 4. Submit a PR
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## Sponsor

Lokus is free and open source. If you find it useful, consider supporting development:

<div align="center">

[![Sponsor on Open Collective](https://img.shields.io/badge/Sponsor-Open%20Collective-7FADF2?style=for-the-badge&logo=opencollective&logoColor=white)](https://opencollective.com/lokus)

</div>

Your support helps with:
- Feature development
- Bug fixes
- Documentation
- Infrastructure costs

**100% transparent** - All expenses are visible on Open Collective.

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

- [Discord](https://discord.com/invite/2rauPDEXcs) - Chat, support, community
- [Reddit](https://www.reddit.com/r/LokusMD/) - Share workflows and tips
- [GitHub Discussions](https://github.com/lokus-ai/lokus/discussions) - Q&A, feature requests
- [GitHub Issues](https://github.com/lokus-ai/lokus/issues) - Bug reports

---

## Roadmap

### Current (v1.3)

- [x] Database views (Bases)
- [x] MCP Server with 68+ tools
- [x] Windows, macOS, Linux support
- [x] Plugin system
- [x] Gmail integration
- [x] 2D/3D knowledge graph

### Planned

- [ ] Mobile apps (iOS & Android)
- [ ] Calendar view for databases
- [ ] PDF annotations
- [ ] Web clipper
- [ ] E2E encryption

[Vote on features](https://github.com/lokus-ai/lokus/discussions/categories/roadmap)

---

## FAQ

<details>
<summary><b>Is Lokus compatible with Obsidian?</b></summary>

Yes. Lokus uses standard markdown files. Point it at your Obsidian vault and it works - notes, wiki links, attachments.

</details>

<details>
<summary><b>Is sync free?</b></summary>

Lokus doesn't have built-in sync, but your notes are plain files. Use any sync solution you want - Dropbox, Google Drive, iCloud, Syncthing.

</details>

<details>
<summary><b>Does it work offline?</b></summary>

Yes. Lokus is local-first. Everything works offline except optional features like Gmail integration.

</details>

<details>
<summary><b>What about privacy?</b></summary>

Your data stays on your device. No telemetry, no tracking. The app is open-source - you can verify this yourself.

</details>

<details>
<summary><b>How do I report bugs?</b></summary>

[Open an issue](https://github.com/lokus-ai/lokus/issues/new?template=bug_report.yml) or [join our Discord](https://discord.com/invite/2rauPDEXcs).

</details>

---

## License

MIT License - free to use, modify, and distribute.

See [LICENSE](LICENSE) for details.

---

## Acknowledgments

Built with:

- [TipTap](https://tiptap.dev) - Editor framework
- [Tauri](https://tauri.app) - Desktop app framework
- [TLDraw](https://tldraw.com) - Canvas
- [Three.js](https://threejs.org) - 3D visualization

Thanks to all [contributors](https://github.com/lokus-ai/lokus/graphs/contributors)!

---

<div align="center">

[![Star History Chart](https://api.star-history.com/svg?repos=lokus-ai/lokus&type=Date)](https://star-history.com/#lokus-ai/lokus&Date)

---

[Website](https://lokusmd.com) &bull; [Documentation](https://docs.lokusmd.com/) &bull; [Discord](https://discord.com/invite/2rauPDEXcs) &bull; [Reddit](https://www.reddit.com/r/LokusMD/) &bull; [Sponsor](https://opencollective.com/lokus)

**If Lokus is useful to you, please star the repo!**

[![Star on GitHub](https://img.shields.io/github/stars/lokus-ai/lokus?style=social)](https://github.com/lokus-ai/lokus)

</div>
