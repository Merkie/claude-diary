/**
 * Claude Diary - Prompt Extraction Script
 *
 * Reads ~/.claude/history.jsonl and extracts user prompts grouped by day.
 * Outputs JSON files per day into data/prompts/.
 *
 * Usage: npx tsx scripts/extract.ts [--days N] [--from YYYY-MM-DD] [--to YYYY-MM-DD]
 *
 * Options:
 *   --days N          Extract the last N days (default: 7)
 *   --from YYYY-MM-DD Start date (inclusive)
 *   --to YYYY-MM-DD   End date (inclusive)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

interface HistoryEntry {
	display: string;
	pastedContents: Record<string, unknown>;
	timestamp: number;
	project: string;
}

interface ExtractedPrompt {
	prompt: string;
	sentAt: string;
	cwd: string;
	timestamp: number;
}

function parseArgs() {
	const args = process.argv.slice(2);
	let days = 7;
	let from: Date | null = null;
	let to: Date | null = null;

	for (let i = 0; i < args.length; i++) {
		if (args[i] === "--days" && args[i + 1]) {
			days = parseInt(args[i + 1]);
			i++;
		} else if (args[i] === "--from" && args[i + 1]) {
			from = new Date(args[i + 1] + "T00:00:00");
			i++;
		} else if (args[i] === "--to" && args[i + 1]) {
			to = new Date(args[i + 1] + "T23:59:59.999");
			i++;
		}
	}

	if (!from) {
		from = new Date();
		from.setDate(from.getDate() - days);
		from.setHours(0, 0, 0, 0);
	}
	if (!to) {
		to = new Date();
		to.setHours(23, 59, 59, 999);
	}

	return { from, to };
}

function formatTimestamp(ts: number): string {
	const dt = new Date(ts);
	const days = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];
	const months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	const dayName = days[dt.getDay()];
	const monthName = months[dt.getMonth()];
	const date = dt.getDate();
	let hours = dt.getHours();
	const minutes = dt.getMinutes().toString().padStart(2, "0");
	const ampm = hours >= 12 ? "PM" : "AM";
	hours = hours % 12 || 12;

	return `${dayName}, ${monthName} ${date} ${hours}:${minutes}${ampm}`;
}

function dateKey(ts: number): string {
	const dt = new Date(ts);
	const month = (dt.getMonth() + 1).toString().padStart(2, "0");
	const day = dt.getDate().toString().padStart(2, "0");
	const year = dt.getFullYear();
	return `${month}-${day}-${year}`;
}

function main() {
	const { from, to } = parseArgs();
	const historyPath = join(homedir(), ".claude", "history.jsonl");

	if (!existsSync(historyPath)) {
		console.error("Could not find ~/.claude/history.jsonl");
		console.error(
			"Make sure you have Claude Code installed and have used it at least once."
		);
		process.exit(1);
	}

	console.log(
		`Extracting prompts from ${from.toLocaleDateString()} to ${to.toLocaleDateString()}\n`
	);

	const content = readFileSync(historyPath, "utf-8");
	const lines = content.trim().split("\n");

	// Parse and filter entries
	const entries: { dt: Date; entry: HistoryEntry }[] = [];
	for (const line of lines) {
		try {
			const entry = JSON.parse(line) as HistoryEntry;
			const dt = new Date(entry.timestamp);
			if (dt >= from && dt <= to) {
				entries.push({ dt, entry });
			}
		} catch {
			// Skip malformed lines
		}
	}

	// Deduplicate: remove entries with identical prompt text within 60 seconds
	const deduped: { dt: Date; entry: HistoryEntry }[] = [];
	for (const item of entries) {
		const isDup = deduped.some(
			(d) =>
				d.entry.display === item.entry.display &&
				Math.abs(d.entry.timestamp - item.entry.timestamp) < 60_000
		);
		if (!isDup) {
			deduped.push(item);
		}
	}

	// Filter out noise (empty prompts, single characters, slash commands)
	const filtered = deduped.filter((item) => {
		const prompt = item.entry.display.trim();
		if (!prompt) return false;
		if (prompt.length <= 1) return false;
		if (prompt.startsWith("/") && !prompt.includes(" ")) return false;
		return true;
	});

	// Group by day
	const byDay = new Map<string, ExtractedPrompt[]>();
	for (const item of filtered) {
		const key = dateKey(item.entry.timestamp);
		if (!byDay.has(key)) {
			byDay.set(key, []);
		}
		byDay.get(key)!.push({
			prompt: item.entry.display,
			sentAt: formatTimestamp(item.entry.timestamp),
			cwd: item.entry.project || "",
			timestamp: item.entry.timestamp,
		});
	}

	// Write output files
	const outputDir = join(import.meta.dirname!, "..", "data", "prompts");
	mkdirSync(outputDir, { recursive: true });

	let totalPrompts = 0;
	for (const [day, prompts] of [...byDay.entries()].sort()) {
		const filePath = join(outputDir, `${day}.json`);
		writeFileSync(filePath, JSON.stringify(prompts, null, 2));

		const projects = new Set(
			prompts
				.map((p) => p.cwd.split("/").pop())
				.filter(Boolean)
		);
		console.log(
			`  ${day}: ${prompts.length} prompts across ${[...projects].join(", ")}`
		);
		totalPrompts += prompts.length;
	}

	console.log(`\nTotal: ${totalPrompts} prompts across ${byDay.size} days`);
	console.log(`Output: ${outputDir}/`);
}

main();
