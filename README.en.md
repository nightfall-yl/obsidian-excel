# obsidian-excel

> Free Excel-like spreadsheet plugin for Obsidian, powered by [Univer](https://github.com/dream-num/univer).

[![Version](https://img.shields.io/badge/version-26.5.4-blue)](https://github.com/nightfall_yl/obsidian-excel)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Obsidian](https://img.shields.io/badge/Obsidian-0.15.0%2B-purple)](https://obsidian.md)
[**中文**](README.md) | English

## Changelog

### v26.5.3

- **i18n: Sheet name locale fix** — New sheets now correctly follow the system language (Chinese displays "工作表1", English displays "Sheet1"). Sheets created via the "+" button on the sheet tab bar are also automatically numbered.
- **UI: Formula bar alignment fix** — Fixed inconsistent vertical height between the Defined Name input and the formula editor in the formula bar, caused by mismatched `padding` values. All elements now align properly via flex centering.
- **UI: Sheet bar spacing** — Added bottom padding to prevent the Univer native sheet bar from overlapping the Obsidian status bar, which previously obscured grid toggle and zoom controls.

## Features

### Core

- **Full spreadsheet editor** — Create and edit multi-sheet workbooks with a familiar Excel-like UI
- **Formula engine** — Complete formula support including SUM, AVERAGE, IF, VLOOKUP, and hundreds more
- **Cell formatting** — Number formats, fonts, colors, borders, alignment, merge cells, freeze panes
- **Conditional formatting** — Highlight cells based on rules (color scales, data bars, icon sets)
- **Data validation** — Dropdown lists, number ranges, date constraints
- **Sorting & filtering** — Sort rows/columns, filter by criteria
- **Hyperlinks & notes** — Add clickable links and cell comments
- **Thread comments** — Collaborative cell discussions

### Import / Export

- **Import `.xlsx` files** — Open existing Excel workbooks directly
- **Export to `.xlsx`** — Save your sheets as standard Excel files
- **Embed links** — Reference other Obsidian notes as embedded content within cells

### Mobile Support

- **Preview mode** (default) — Read-only view optimized for mobile reading; no keyboard popup, smooth scrolling
- **Edit mode** — Full editing capabilities with toolbar, sheet tabs, and cell input
- **One-tap toggle** — Switch between preview and edit modes via the icon button in the top-right corner
- **Sheet position memory** — When switching modes, the active sheet is preserved

### Integration

- **`.sheet.md` files** — Sheets are stored as Markdown files with structured data blocks
- **Frontmatter detection** — Any Markdown file with `obsidian-excel: parsed` frontmatter auto-opens in Sheet View
- **Ribbon & commands** — Create new sheets from the ribbon icon, command palette, or file context menu
- **Dark mode** — Automatically follows Obsidian's theme setting
- **Auto-save** — Changes are saved automatically after 5 seconds of inactivity

## Installation

1. Download the latest release from [Releases](../../releases)
2. Extract to your vault's `.obsidian/plugins/obsidian-excel/` folder
3. Reload Obsidian (or enable the plugin in Settings → Community plugins)

Or install manually:

```bash
cd your-vault/.obsidian/plugins/
git clone https://github.com/nightfall_yl/obsidian-excel.git
cd obsidian-excel
npm install
npm run build
```

## Usage

### Creating a New Sheet

- Click the **Spreadsheet** icon in the left ribbon
- Use the command palette (`Ctrl/Cmd + P`) → "Create new spreadsheet"
- Right-click any folder → "Create new spreadsheet"

### Opening an Existing Sheet

- Click any `.sheet.md` file to open it in Sheet View
- Files with `obsidian-excel: parsed` frontmatter open automatically

### Importing XLSX

1. Open or create a sheet
2. Click the **Import XLSX** button in the toolbar
3. Select a `.xlsx` file to import

### Exporting to XLSX

1. Open a sheet
2. Click the **Export XLSX** button in the toolbar
3. The workbook is downloaded as a `.xlsx` file

### Mobile Mode Toggle

On mobile devices, use the **book/pencil icon** in the top-right corner to switch between:
- **Preview mode** — Read-only, optimized for viewing
- **Edit mode** — Full editing with all features enabled

## File Format

Sheets are stored as plain-text Markdown files:

```markdown
---
obsidian-excel: parsed
---

```sheet
{ ... Univer workbook JSON ... }
```
```

This means sheets are fully compatible with Git version control and can be edited as text if needed.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Spreadsheet Engine | [Univer](https://univer.ai) 0.20.x |
| Build Tool | Vite |
| Language | TypeScript |
| XLSX I/O | [SheetJS (xlsx)](https://sheetjs.com) |

## Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Watch mode (development)
npm run dev
```

Built files are output to `dist/main.js`, `dist/styles.css`, and `dist/manifest.json`, and are automatically copied back to the project root.

## Credits

- [Univer](https://github.com/dream-num/univer) — The underlying spreadsheet engine
- [SheetJS](https://sheetjs.com) — XLSX import/export support
- [Obsidian](https://obsidian.md) — The note-taking app that makes this possible

## License

[MIT](LICENSE)
