# Code Intelligence: code-review-graph + codesight

> Reference doc for `CLAUDE.md`. This repo ships **two complementary** code-intelligence
> tools. Use them **before** Grep/Glob/Read — they are faster, cheaper, and give
> structural context that file scanning cannot. Fall back to raw file tools only when
> these don't cover what you need.

## The two tools and how they complement each other

| | **code-review-graph** | **codesight** |
| --- | --- | --- |
| What | Persistent **queryable knowledge graph** (Tree-sitter parse) | Static **markdown context map** |
| Surface | **MCP tools** (live queries) | Files in `.codesight/*.md` (read them) |
| Freshness | **Auto-updates** on every Edit/Write/Bash (PostToolUse hook) | Manual — regenerate with `codesight` |
| Authority | **Live source of truth** for structure/impact | Cheap orientation snapshot (may be stale) |
| Store | `.code-review-graph/graph.db` (SQLite, gitignored) | `.codesight/` (gitignored) |
| Best for | callers/callees, impact radius, review context, communities | "what is this repo / where does X live", first 30s of orientation |

**Workflow:** skim `.codesight/CODESIGHT.md` for instant orientation → use code-review-graph
MCP tools for precise structural queries → drop to Read/Grep for full source. The graph is
authoritative when the two disagree (it auto-refreshes; codesight does not).

Current graph snapshot: ~37 files, ~84 nodes (46 functions, 1 test node), 6 communities
matching the top-level dirs (`app`, `components`, `components/test`, `lib`, `next.config`,
`scripts`). Expected high-coupling warning: `app-root ↔ components-section` (`page.tsx`
assembles every section — by design).

## code-review-graph

MCP server registered in `.mcp.json` (`uvx code-review-graph serve`, cwd = repo). CLI at
`code-review-graph` (subcommands `build|update|status|postprocess|watch|detect-changes|
serve|wiki|visualize`).

**Hooks** (`.claude/settings.json`):
- `PostToolUse` on `Edit|Write|Bash` → `code-review-graph update --skip-flows` (incremental,
  keeps the graph fresh automatically).
- `SessionStart` → `code-review-graph status` (prints node/edge counts at session start).

**Key MCP tools** (use FIRST):

| Tool | Use when |
| --- | --- |
| `detect_changes` | Reviewing code changes — risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Which execution paths a change impacts |
| `query_graph` | Trace callers/callees/imports/importers/tests (`pattern=tests_for`, etc.) |
| `semantic_search_nodes` | Find functions/classes by name or keyword |
| `get_architecture_overview` / `list_communities` | High-level structure |
| `refactor_tool` | Plan renames, find dead code |

**Notes:**
- Embeddings are **not** built (`Embeddings: 0`), so `semantic_search_nodes` falls back to
  FTS5/keyword matching. To enable true semantic search: `pip install sentence-transformers`
  then `embed_graph` (provider `local`) — optional, not required.
- If the graph looks stale or empty, run `code-review-graph build` (full re-parse) then
  `code-review-graph postprocess` (flows/communities/FTS).

## codesight

CLI `codesight` (v1.13.x, global). Scans the repo and writes `.codesight/`:
`CODESIGHT.md` (the combined map), plus `components.md`, `libs.md`, `config.md`,
`graph.md` (import map / most-imported files), `coverage.md`, `middleware.md`.

**Refresh:** run `codesight` from the repo root. Reads `.codesightignore` (gitignore-style)
to stay focused on source and avoid indexing tool artifacts.

**⚠️ NEVER run these flags here:**
- `codesight --init` — **overwrites `CLAUDE.md`, `.cursorrules`, and other agent config
  files** with its own generated versions. It would destroy this project's curated CLAUDE.md.
- `codesight --hook` — installs a git pre-commit hook that re-scans on every commit. Not
  wanted: `.codesight/` is a gitignored local artifact here, refreshed on demand.

Useful read-only flags: `codesight --blast <file>` (blast radius of one file),
`codesight --html`/`--open` (visual report).

## Configuration & no-interference setup

Both tools' outputs are **gitignored local artifacts** that never collide:
- `.gitignore` ignores `.code-review-graph/` (binary DB; also self-ignored by
  `.code-review-graph/.gitignore`) and `.codesight/` (regenerated map).
- `.claudeignore` excludes `.code-review-graph/` so Claude never wastes tokens reading the
  binary DB. `.codesight/*.md` is intentionally **left readable** — those maps are meant for
  Claude.
- `.codesightignore` excludes `.code-review-graph/`, `.codesight/`, `.next/`,
  `.pm2-isolated/`, `logs/`, `node_modules/` so codesight indexes only source and the two
  tools never index each other.

This keeps the division clean: **code-review-graph = live/authoritative** (hook-refreshed,
queried via MCP); **codesight = cheap static orientation** (regenerated on demand). Neither
appears in `git status` or pollutes the other's index.
