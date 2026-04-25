# pi-duckfeed

> A Pi extension that searches the web with DuckDuckGo and fetches pages, PDFs, and GitHub repos as markdown — your AI's complete slop delivery service.

## Overview

`pi-duckfeed` provides web browsing capabilities for the Pi coding agent, powered by DuckDuckGo. It handles two distinct but complementary tasks:

1. **Search the web** — Get search results via DuckDuckGo's API
2. **Fetch content** — Extract markdown from HTML pages, PDFs, and GitHub repositories

## Tools

### 🔍 `search` — Web Search

Search the web using DuckDuckGo and get back titles, URLs, and snippets.

**Parameters:**
- `query` (string) — Search query. Use concise key phrases for best results.
- `max_results` (number, optional) — Maximum results to return. Default: 10, Max: 20.

**Example:**
```typescript
await tools.search({ query: "TypeScript performance best practices", max_results: 10 });
```

**Returns:**
- Formatted markdown list of search results with titles, URLs, and snippets
- Results are ready to use for follow-up `open` calls

---

### 📄 `open` — Extract Page Content

Open a URL and extract its content as clean markdown. Supports multiple formats:

- **HTML pages** — Via Mozilla Readability + Turndown (reader mode extraction)
- **PDFs** — Via pdf-parse (text extraction)
- **GitHub URLs** — Clones repos locally for exploration with `read` and `bash`
- **Plain text** — Direct passthrough

**Parameters:**
- `url` (string) — The URL to open (http:// or https:// only)
- `forceClone` (boolean, optional) — Force full git clone for GitHub repos even if >350MB. Default: false.

**Example:**
```typescript
await tools.open({ url: "https://example.com/article" });
await tools.open({ url: "https://arxiv.org/pdf/2401.1234.pdf" });
await tools.open({ url: "https://github.com/microsoft/TypeScript" });
```

**Returns:**
- Clean markdown content (truncated to ~80k characters if needed)
- For GitHub repos: local path to the cloned repo for further exploration
- For truncated content: path to a temp file with the full content

---

### 🔎 `find` — Search Within Pages

Search for specific text within a page's content without re-reading the entire page.

**Features:**
- Searches cached content from previous `open` calls (fast)
- For GitHub repos with local clones: searches across **all files** using grep
- Returns matches with line numbers and context

**Parameters:**
- `url` (string) — The URL to search within
- `phrase` (string) — The key phrase to search for
- `forceClone` (boolean, optional) — Force full git clone for GitHub repos. Default: false.

**Example:**
```typescript
await tools.find({ 
  url: "https://github.com/microsoft/TypeScript", 
  phrase: "compiler options" 
});
```

**Returns:**
- Matches with line numbers and surrounding context
- For GitHub repos: file paths, line numbers, and matching lines
- Maximum 50 matches shown (with total count if more exist)

---

## GitHub Integration

The extension has special handling for GitHub URLs:

### URL Types Supported
- Root: `https://github.com/owner/repo`
- Tree: `https://github.com/owner/repo/tree/branch`
- Blob: `https://github.com/owner/repo/blob/branch/path/to/file`
- Commit: `https://github.com/owner/repo/commit/hash`

### Smart Size Handling

| Repo Size | Action |
|-----------|--------|
| < 350 MB | Cloned locally (shallow clone, default branch only) |
| ≥ 350 MB | Lightweight API view (README + structure, no clone) |
| Any size (with `forceClone: true`) | Full clone regardless of size |

### Clone Cache

- Session-scoped: clones persist during your Pi session
- Cleanup: automatic cleanup when session ends
- Reuse: subsequent `open`/`find` calls reuse existing clones

---

## Content Extraction Details

### HTML Pages
- Uses Mozilla Readability for article extraction
- Converts to markdown via Turndown
- Falls back to full page body if Readability fails
- Max HTML size: 1MB

### PDFs
- Uses pdf-parse for text extraction
- Returns raw text content
- Max PDF size: 10MB

### Truncation
- Content > 80k characters is truncated
- Full content saved to temp file with path included in response
- Prevents context overflow while preserving access to full content

---

## Configuration

### Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `MAX_CONTENT_LENGTH` | 80,000 | Max characters before truncation |
| `MAX_HTML_SIZE` | 1MB | Maximum HTML page size |
| `MAX_PDF_SIZE` | 10MB | Maximum PDF file size |
| `MAX_CACHE_SIZE` | 20 | LRU cache size for opened pages |
| `MAX_FIND_MATCHES` | 50 | Maximum matches shown per search |
| `GITHUB_SIZE_THRESHOLD_MB` | 350 | MB threshold for API view vs clone |
| `GITHUB_CLONE_TIMEOUT_MS` | 120,000 | 2 minute timeout for git clone |
| `GITHUB_API_TIMEOUT_MS` | 30,000 | Timeout for GitHub API calls |
| `SEARCH_TIMEOUT_MS` | 30,000 | Timeout for DDG search |

---

## Dependencies

### Runtime
- `@mozilla/readability` — HTML article extraction
- `turndown` — HTML to Markdown conversion
- `pdf-parse` — PDF text extraction
- `jsdom` — HTML parsing
- `ddgs` — DuckDuckGo search API (via `uv run --with ddgs`)

### Development
- `@sinclair/typebox` — Tool parameter schemas
- `@types/bun` — Bun type definitions
- `@mariozechner/pi-tui` — Terminal UI components
- `biome` — Linting and formatting

---

## Usage Guidelines

### When to Use Each Tool

1. **Use `search` when:**
   - You need to find information on current events, facts, or topics you're unsure about
   - You don't know the specific URL
   - You want multiple sources on a topic

2. **Use `open` when:**
   - You have a specific URL from search results or the user
   - You need the full content of a page
   - You want to read a PDF or explore a GitHub repo

3. **Use `find` when:**
   - You've already opened a page and need to locate specific content
   - You want to search within a GitHub repo without reading everything
   - You're checking if a page contains specific information

### Best Practices

- **Search queries:** Use concise key phrases, not full sentences
- **Opening pages:** Open one page at a time to avoid overwhelming context
- **GitHub repos:** Use the returned local path with `read` and `bash` for detailed exploration
- **Large repos:** Use `forceClone: true` only when you need the full repo structure

---

## Project Structure

```
pi-duckfeed/
├── index.ts              # Main extension entry point
├── constants.ts          # Configuration constants
├── types.ts              # TypeScript type definitions
├── content/              # Content extraction module
│   ├── index.ts          # Barrel exports
│   ├── fetch.ts          # URL fetching with GitHub routing
│   ├── html-to-markdown.ts # HTML to MD conversion
│   └── pdf.ts            # PDF to MD conversion
├── github/               # GitHub integration
│   ├── index.ts          # Barrel exports
│   ├── parse-url.ts      # GitHub URL parser
│   ├── clone-manager.ts  # Session-scoped git clone cache
│   ├── api-view.ts       # Lightweight API views for large repos
│   └── format.ts         # Markdown formatters
├── tools/                # Tool implementations
│   ├── index.ts          # Barrel exports
│   ├── open-tool.ts      # Open page tool
│   ├── find-tool.ts      # Find/search tool
│   └── search-tool.ts    # DDG search tool
├── ddgs/                 # DuckDuckGo integration
│   ├── search.ts         # Search via ddgs CLI
│   └── extract.ts        # Extract via ddgs CLI
└── utils/                # Utilities
    ├── cache.ts          # LRU page cache
    └── formatter.ts      # Search result formatters
```

---

## Development

### Prerequisites
- Node.js / Bun
- `uv` package manager (for DDG search via Python `ddgs` library)

### Setup
```bash
# Install dependencies
bun install

# Run tests
bun test

# Run linter
bun run lint

# Auto-fix lint issues
bun run lint:fix

# Format code
bun run format
```

### Testing
```bash
# Run all tests
bun test

# Run specific test file
bun test content/fetch.test.ts

# Watch mode
bun test --watch
```
