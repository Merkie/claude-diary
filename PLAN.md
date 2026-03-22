# Claude Diary

Turn your Claude Code conversations into a daily dev diary.

## Concept

Every day you use Claude Code, your prompts are logged to `~/.claude/history.jsonl`. Claude Diary reads this data, groups it by day, and generates a narrative diary entry summarizing what you worked on — across all projects, in chronological order.

The result is a beautiful, skeuomorphic diary UI (SolidJS + Vite + GSAP) that lets you flip through your dev history day by day.

## Data Source

`~/.claude/history.jsonl` — each line is a JSON object:

```json
{
  "display": "Please look at the code and see what we would need to do...",
  "pastedContents": {},
  "timestamp": 1760034137458,
  "project": "/Users/archer/Desktop/huzi/sparkpad-v2"
}
```

- **timestamp**: Unix milliseconds — gives us exact time of each prompt
- **project**: Working directory — tells us which project was being worked on
- **display**: The user's prompt text — tells us what was being done

This is the only data source needed. Claude's responses are not required — the prompts themselves tell the full story of what the user did and decided.

## Data Pipeline

### Step 1: Extract (`scripts/extract.ts`)

Reads `~/.claude/history.jsonl` and produces structured JSON:

```json
{
  "03/16/2026": [
    {
      "prompt": "Please checkout staging on huzi-core-api and sparkpad-v2",
      "sentAt": "Monday, March 16 11:56AM",
      "cwd": "/Users/archer/Desktop/huzi/sparkpad-v2",
      "timestamp": 1760034137458
    }
  ]
}
```

Key processing:
- Deduplicate near-identical prompts (some appear twice from retries)
- Convert timestamps to local timezone
- Group by calendar day
- Sort chronologically within each day
- Extract project name from cwd path

### Step 2: Generate (`scripts/generate.ts`)

Takes the extracted JSON and generates markdown diary entries per day. Uses Claude API with **parallel subagents** (Haiku or Sonnet) — each day gets its own subagent so a full week generates in seconds, not minutes.

Each entry captures:
- What projects were worked on
- What features were built, bugs were fixed, decisions were made
- The natural flow of the day (project-hopping, rabbit holes, etc.)
- Chronological order preserved

#### Writing Styles

Users pick their preferred writing style at setup (stored in config, can be changed anytime):

- **Dev Log** — Concise bullet points. Information-dense, scannable. Great for quickly reviewing what happened.
- **Journal** — Narrative prose. Reads like an actual diary with flow and personality. More fun to read back.

### Step 3: Serve (`src/`)

SolidJS + Vite webapp that displays the diary entries.

## Architecture

```
claude-diary/
├── scripts/
│   ├── extract.ts          # Read history.jsonl -> structured JSON
│   └── generate.ts         # Structured JSON -> diary entries (via Claude API)
├── data/
│   ├── prompts/            # Extracted prompts grouped by day (JSON)
│   └── entries/            # Generated diary entries (Markdown)
├── src/
│   ├── index.tsx           # App entry
│   ├── App.tsx             # Main layout
│   ├── components/
│   │   ├── DiaryBook.tsx   # Main diary container (book metaphor)
│   │   ├── DiaryEntry.tsx  # Single day's entry
│   │   ├── DayNav.tsx      # Day picker / calendar navigation
│   │   └── ProjectBadge.tsx # Visual badge for each project
│   ├── lib/
│   │   ├── entries.ts      # Load and manage diary entries
│   │   └── animations.ts   # GSAP page-turn transitions
│   └── styles/
│       └── diary.css       # Skeuomorphic diary styling
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── PLAN.md
```

## UI Design

### Generated Assets

Diary UI assets (cover, open book pages, textures) are **AI-generated images** created during setup. The cover is customizable — users could add their own logo, the Claude mascot, etc. via post-processing in an image editor.

Preset themes to choose from during setup:
- **Classic Leather** — Brown leather-bound journal, gold embossing, aged paper
- **Pastel Dream** — Pink/lavender fluffy diary, stickers, sparkly accents
- **Terminal** — Dark mode, monospace, green-on-black CRT aesthetic
- **Minimal** — Clean white, no textures, just typography

Each theme is a set of generated assets + a CSS theme file. The generation script produces:
- Diary cover (closed book, front-facing)
- Open book spread (two-page layout with visible spine)
- Page texture/background
- Decorative elements (bookmark ribbon, corner flourishes, etc.)

### Layout & Interactions

**Skeuomorphic diary aesthetic:**
- Book container with cover/spine rendered from generated assets
- Cream/aged paper background for entries (or theme-appropriate)
- Handwriting-inspired fonts for headers
- Ink-style text for entry content
- Page-turn animations via GSAP for day navigation
- Ribbon bookmark for "today"
- Project badges with distinct colors per project

**Layout:**
- Left side: calendar/day navigation
- Right side: diary entry for selected day
- Page flip animation when switching days

## Distribution: "Install with Claude"

For other users, the install process is:

```bash
claude "Please install this for me https://raw.githubusercontent.com/Merkie/claude-diary/main/INSTALL.md"
```

The `INSTALL.md` contains instructions for Claude to:
1. Clone the repo to a local directory
2. Install dependencies
3. Run the extraction script against the user's local `~/.claude/history.jsonl`
4. Generate initial diary entries
5. Start the dev server

This approach is intentionally fun — it uses Claude to install a tool made for Claude.

## Development Plan

### Phase 1: Data & Entries (current)
- [x] Extract prompts from history.jsonl
- [x] Generate diary entries for March 16-20, 2026 (proof of concept)
- [x] Build extraction script (`scripts/extract.ts`)
- [ ] Build generation script (`scripts/generate.ts`) with parallel subagents
- [ ] Implement writing style selection (Dev Log vs Journal)

### Phase 2: Assets & Theming
- [ ] Generate skeuomorphic UI assets (cover, open book, page textures)
- [ ] Build theme system (Classic Leather, Pastel Dream, Terminal, Minimal)
- [ ] Theme selection during setup

### Phase 3: Webapp
- [ ] Scaffold SolidJS + Vite + TailwindCSS project
- [ ] Build diary entry component
- [ ] Build day navigation
- [ ] Add GSAP page-turn animations
- [ ] Skeuomorphic styling with generated assets

### Phase 4: Polish & Distribution
- [ ] Write INSTALL.md for "Install with Claude"
- [ ] GitHub repo setup
- [ ] README with screenshots
- [ ] Handle edge cases (empty days, very long sessions, etc.)
