---
name: generate
description: Generate diary entries from extracted prompt data using parallel subagents
disable-model-invocation: true
argument-hint: [journal|devlog] [--force] [--from MM-DD-YYYY] [--to MM-DD-YYYY]
---

Generate diary entries from the extracted prompt data in `data/prompts/`.

## Steps

1. List all `.json` files in `data/prompts/`
2. Parse the arguments to determine:
   - **Writing style**: first positional argument — `journal` (default) or `devlog`
   - **--force**: regenerate entries even if they already exist in `data/entries/`
   - **--from MM-DD-YYYY**: only generate entries on or after this date
   - **--to MM-DD-YYYY**: only generate entries on or before this date
3. For each prompt file, check if a corresponding `.md` file already exists in `data/entries/`. Skip it unless `--force` was passed.
4. For all days that need generation, spawn `diary-writer` subagents **in parallel** (one per day). Each subagent should receive:
   - The path to the prompt JSON file (e.g., `data/prompts/03-16-2026.json`)
   - The writing style
   - The output path (e.g., `data/entries/03-16-2026.md`)
5. After all subagents complete, report which entries were generated.

## Important

- Use the `diary-writer` subagent for each day — do NOT write entries yourself
- Launch all subagents in parallel in a single message, not one at a time
- If there are no prompt files to process, inform the user and suggest running the extraction script: `npx tsx scripts/extract.ts`

$ARGUMENTS
