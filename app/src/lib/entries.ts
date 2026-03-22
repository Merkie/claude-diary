export interface DiaryEntry {
	date: string;
	title: string;
	projects: string[];
	content: string;
}

// In the future this will load from generated files.
// For now, we use hardcoded sample entries for development.
const sampleEntries: DiaryEntry[] = [
	{
		date: "2026-03-16",
		title: "Monday, March 16",
		projects: [
			"sparkpad-v2",
			"open-harness",
			"server-dashboard",
			"solace-media-player",
			"rhythm-control",
			"video-carousel",
		],
		content: `Started the morning pushing sparkpad-v2 to main and switching repos over to staging branches. Then jumped into something new — created a concept for **SPEC.md files** across all projects. The idea is a living feature checklist: a preamble explaining what the app does, then grouped features with their current status. Built the first one for server-dashboard.

From there, dove deep into **open-harness**. The big change: replacing long-running API calls with a **polling/job system**. Instead of a 30-120 second hanging request, endpoints now immediately return a job ID. Clients poll for status — "running", "complete", "not found", or "error" — with results held in memory for 60 seconds before cleanup.

Also added a **commentary tool** — the agent now narrates what it's doing before and after every action. Maximum transparency for the user, and it actually improves the agent's performance too.

After getting the polling system working, updated **all clients in the huzi monorepo** to use the new open-harness API. Migrated sparkpad-v2's image generation to go through open-harness instead of having its own native implementation.

Shifted gears to **rhythm-control** — investigated old device sync bugs and wrote a detailed article documenting the correct implementation patterns for device-synced apps.

Big project pivot: took the rhythm-control codebase and stripped it down into **solace-media-player** — a standalone player for Solace media files. Removed all game UI, kept the playback mechanics (AirPod removal detection, spacebar pause, tetris shuffle). Pushed to GitHub.

Meanwhile, built an embedded **documentation wiki** in the sparkpad-v2 admin panel covering tools, departments, agents, skills, and platform creation.

158 prompts. An absolute marathon of a day.`,
	},
	{
		date: "2026-03-17",
		title: "Tuesday, March 17",
		projects: ["sparkpad-v2", "archers-stack"],
		content: `Light day. Fixed a **layout shift bug** in sparkpad-v2 — when the welcome message finishes its typing animation, the content would jump. The fix was to sync the rendering approach between the welcome message and the regular message stream, preloading the message with delayed chunks so the transition is smooth. Got it working and pushed to main.

In the afternoon, set up **archers-stack** — pasted in a large block of code and continued working through it.

9 prompts. Sometimes you just fix one good bug and call it a day.`,
	},
	{
		date: "2026-03-18",
		title: "Wednesday, March 18",
		projects: ["open-harness", "sparkpad-v2", "HuziPublicSite"],
		content: `Checked the tech stack on the Huzi public site, then went straight into a deep open-harness session that lasted most of the day.

Started with **artifact testing and debugging** — ran the dev server, fired off test requests, and read through the agent's steps to spot quirks. Tested with different models, landing on **Gemini 3.1 Flash Lite Preview** as the default.

This led to a significant **plugin architecture redesign**. Designed a new chainable API: createAgentTask().use().use(SomePlugin).run(). Key ideas: responseType can be "text", a Zod schema, or "file"; plugins share state between tools at runtime; submit hooks enforce rules like "artifact must be tested before submission."

Also refactored the **file resolution system** — changed the files API so each file declares its content type as either raw data or a URL, moving all fetching into runAgent where it can be parallelized.

Wrote an **i18n research article** for sparkpad-v2. The boss has deals in the works with contacts from Brazil and the UAE.

131 prompts. Architecture day — the kind where you reshape the foundation.`,
	},
	{
		date: "2026-03-19",
		title: "Thursday, March 19",
		projects: ["sparkpad-v2", "open-harness"],
		content: `Morning was **open-harness model work** — added OpenRouter support and configured Gemini 3.1 Flash Lite Preview via OpenRouter as the artifact model.

The main event was building the **spotlight tutorial system** — a guided onboarding tour that replaces the old "New Platform Wizard" popup. Designed a 12-step flow: welcome card, landing actions, send a message, voice-to-text, departments, agents, skills, info box, platform switcher, settings, manage platform, and a congratulations screen with confetti.

The implementation was intense — spotlight highlighting with a floating card, many iterations on the platform switcher step (the spotlight box needed to stretch to contain both button and dropdown), animation fixes (card animating from top-left instead of center), timing tweaks, and a reset tutorial button.

174 prompts. The tutorial feature alone was probably 120+ prompts of back-and-forth refinement.`,
	},
	{
		date: "2026-03-20",
		title: "Friday, March 20",
		projects: ["sparkpad-v2", "open-harness", "ezmocontrol"],
		content: `Started after midnight fixing a **ghost text bug** in sparkpad-v2's tutorial — cards were still selectable even at opacity-0. Added pointer-events-none and select-none.

Afternoon kicked off with investigating **image persistence** across sessions. Traced the full flow and found the vulnerability window is only about 30 seconds between generation starting and the response being saved.

Then the big new thing: **EzmoControl** — built an entire project from scratch in one afternoon. It's a motion control video generation tool using **Kling v3 Pro** via Fal.ai. Set up the monorepo, fixed output parsing, added job cost tracking, built a **Snake game** for users to play while waiting, created PRs for API key encryption and UI tweaks, did a complete design overhaul, and added routing so refreshing doesn't lose your place.

59 prompts. Quality over quantity — shipped an entire new project.`,
	},
];

export function getEntries(): DiaryEntry[] {
	return sampleEntries;
}

export function getEntryByDate(date: string): DiaryEntry | undefined {
	return sampleEntries.find((e) => e.date === date);
}
