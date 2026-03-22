import { createSignal, createMemo, For, Show, Switch, Match, onMount } from "solid-js";
import gsap from "gsap";
import { theme, selectedDate, setSelectedDate } from "@/lib/store";
import { getEntries, getEntryByDate } from "@/lib/entries";

type GlossaryItem =
	| { kind: "header"; label: string }
	| {
			kind: "entry";
			date: string;
			dayShort: string;
			dayNum: string;
			projectCount: number;
	  };

const ITEMS_PER_PAGE = 12;

function ProjectBadge(props: { name: string }) {
	const colors: Record<string, string> = {
		"sparkpad-v2": "bg-blue-50 text-blue-700 border-blue-200",
		"open-harness": "bg-emerald-50 text-emerald-700 border-emerald-200",
		"server-dashboard": "bg-purple-50 text-purple-700 border-purple-200",
		"solace-media-player": "bg-orange-50 text-orange-700 border-orange-200",
		"rhythm-control": "bg-rose-50 text-rose-700 border-rose-200",
		"video-carousel": "bg-cyan-50 text-cyan-700 border-cyan-200",
		"huzi-core-api": "bg-yellow-50 text-yellow-700 border-yellow-200",
		ezmocontrol: "bg-pink-50 text-pink-700 border-pink-200",
		HuziPublicSite: "bg-teal-50 text-teal-700 border-teal-200",
		"archers-stack": "bg-indigo-50 text-indigo-700 border-indigo-200",
	};

	const colorClass = () =>
		colors[props.name] ||
		"bg-neutral-100 text-neutral-600 border-neutral-200";

	return (
		<span
			class={`text-xs px-2 py-0.5 rounded-full border font-sans ${colorClass()}`}
		>
			{props.name}
		</span>
	);
}

function renderMarkdown(text: string) {
	const paragraphs = text.split("\n\n");
	return paragraphs.map((p) => {
		const html = p
			.replace(
				/\*\*(.+?)\*\*/g,
				'<strong class="font-semibold">$1</strong>'
			)
			.replace(/\n/g, "<br />");
		return `<p class="mb-4 leading-relaxed">${html}</p>`;
	});
}

function extractPromptCount(content: string): string | null {
	const match = content.match(/(\d+)\s+prompts?\./);
	return match ? match[1] : null;
}

export default function DiaryView() {
	let containerRef!: HTMLDivElement;

	const [mode, setMode] = createSignal<"glossary" | "entry">("glossary");
	const [glossaryPage, setGlossaryPage] = createSignal(0);

	const allEntries = getEntries();

	const sortedEntries = createMemo(() =>
		[...allEntries].sort((a, b) => b.date.localeCompare(a.date))
	);

	const glossaryItems = createMemo(() => {
		const items: GlossaryItem[] = [];
		let prevMonth = "";
		for (const entry of sortedEntries()) {
			const d = new Date(entry.date + "T12:00:00");
			const monthLabel = d.toLocaleDateString("en-US", {
				month: "long",
				year: "numeric",
			});
			if (monthLabel !== prevMonth) {
				prevMonth = monthLabel;
				items.push({ kind: "header", label: monthLabel });
			}
			items.push({
				kind: "entry",
				date: entry.date,
				dayShort: d.toLocaleDateString("en-US", { weekday: "short" }),
				dayNum: String(d.getDate()),
				projectCount: entry.projects.length,
			});
		}
		return items;
	});

	const totalSpreads = createMemo(() =>
		Math.max(1, Math.ceil(glossaryItems().length / (ITEMS_PER_PAGE * 2)))
	);

	const currentSpread = createMemo(() => {
		const start = glossaryPage() * ITEMS_PER_PAGE * 2;
		const all = glossaryItems().slice(start, start + ITEMS_PER_PAGE * 2);
		return {
			left: all.slice(0, ITEMS_PER_PAGE),
			right: all.slice(ITEMS_PER_PAGE),
		};
	});

	const currentEntry = createMemo(() => getEntryByDate(selectedDate()));

	// ── Theme ──
	const isLeather = () => theme() === "leather";
	const pageColor = () => (isLeather() ? "#f5f0e8" : "#fff5f9");
	const textColor = () => (isLeather() ? "#2c1810" : "#4a1a2e");
	const headingColor = () =>
		isLeather() ? "text-[#5c3a0a]" : "text-[#a04468]";
	const subtextColor = () =>
		isLeather() ? "text-amber-800/40" : "text-pink-400/50";
	const hrColor = () =>
		isLeather() ? "border-[#d4c5a9]" : "border-[#f0c6d8]";
	const bgColor = () => (isLeather() ? "#ddd5c8" : "#f0e0e8");
	const coverGradient = () =>
		isLeather()
			? "linear-gradient(135deg, #5c3a0a 0%, #7a5218 40%, #5c3a0a 100%)"
			: "linear-gradient(135deg, #c4607e 0%, #d4789b 40%, #c4607e 100%)";
	const spineGradient = () =>
		isLeather()
			? "linear-gradient(to right, #4a2e08, #6b4510, #8b6914, #6b4510, #4a2e08)"
			: "linear-gradient(to right, #b8567a, #d4789b, #e8a0bc, #d4789b, #b8567a)";
	const arrowColor = () => (isLeather() ? "#7a5218" : "#c4607e");

	// ── Navigation state ──
	const canGoPrev = () => {
		if (mode() === "glossary") return glossaryPage() > 0;
		const idx = sortedEntries().findIndex(
			(e) => e.date === selectedDate()
		);
		return idx > 0;
	};

	const canGoNext = () => {
		if (mode() === "glossary")
			return glossaryPage() < totalSpreads() - 1;
		const idx = sortedEntries().findIndex(
			(e) => e.date === selectedDate()
		);
		return idx < sortedEntries().length - 1;
	};

	// ── Transitions ──
	function animateTransition(
		changeFn: () => void,
		dir: -1 | 0 | 1 = 0
	) {
		const spread = containerRef.querySelector(
			"[data-spread]"
		) as HTMLElement;
		if (!spread) {
			changeFn();
			return;
		}
		gsap.to(spread, {
			opacity: 0,
			x: dir * -20,
			duration: 0.18,
			ease: "power2.in",
			onComplete: () => {
				changeFn();
				gsap.fromTo(
					spread,
					{ opacity: 0, x: dir * 20 },
					{ opacity: 1, x: 0, duration: 0.22, ease: "power2.out" }
				);
			},
		});
	}

	function goToEntry(date: string) {
		animateTransition(() => {
			setSelectedDate(date);
			setMode("entry");
		}, 1);
	}

	function goToGlossary() {
		animateTransition(() => setMode("glossary"), -1);
	}

	function handlePrev() {
		if (!canGoPrev()) return;
		if (mode() === "glossary") {
			animateTransition(() => setGlossaryPage((p) => p - 1), -1);
		} else {
			const dates = sortedEntries().map((e) => e.date);
			const idx = dates.indexOf(selectedDate());
			animateTransition(() => setSelectedDate(dates[idx - 1]), -1);
		}
	}

	function handleNext() {
		if (!canGoNext()) return;
		if (mode() === "glossary") {
			animateTransition(() => setGlossaryPage((p) => p + 1), 1);
		} else {
			const dates = sortedEntries().map((e) => e.date);
			const idx = dates.indexOf(selectedDate());
			animateTransition(() => setSelectedDate(dates[idx + 1]), 1);
		}
	}

	onMount(() => {
		gsap.fromTo(
			containerRef,
			{ opacity: 0, scale: 0.95 },
			{ opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }
		);
	});

	// ── Glossary row renderer ──
	function glossaryRow(item: GlossaryItem) {
		if (item.kind === "header") {
			return (
				<h3
					class={`text-[13px] font-serif font-bold ${headingColor()} mt-6 first:mt-0 mb-2 uppercase tracking-wider`}
				>
					{item.label}
				</h3>
			);
		}
		return (
			<button
				onClick={() => goToEntry(item.date)}
				class={`flex items-baseline w-full text-left px-2 py-2 rounded-md cursor-pointer transition-colors duration-150 ${
					isLeather()
						? "hover:bg-amber-900/8"
						: "hover:bg-pink-500/8"
				}`}
				style={{ color: textColor() }}
			>
				<span class="text-xs font-sans w-10 shrink-0 opacity-45">
					{item.dayShort}
				</span>
				<span class="font-serif text-sm">{item.dayNum}</span>
				<span
					class="flex-1 mx-3 border-b border-dotted opacity-30"
					style={{
						"border-color": textColor(),
						transform: "translateY(-3px)",
					}}
				/>
				<span class="text-[11px] font-sans opacity-35 shrink-0">
					{item.projectCount}{" "}
					{item.projectCount === 1 ? "project" : "projects"}
				</span>
			</button>
		);
	}

	// ── Gutter shadow helper ──
	function gutterShadow(side: "left" | "right") {
		return (
			<div
				class={`absolute inset-y-0 ${side === "left" ? "right-0" : "left-0"} w-16 pointer-events-none z-10`}
				style={{
					background: `linear-gradient(to ${side === "left" ? "left" : "right"}, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.015) 40%, transparent 100%)`,
				}}
			/>
		);
	}

	return (
		<div
			ref={containerRef}
			class="flex items-center justify-center h-full select-none gap-5"
			style={{ background: bgColor() }}
		>
			{/* Left arrow */}
			<button
				onClick={handlePrev}
				disabled={!canGoPrev()}
				class="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer opacity-40 hover:opacity-80 disabled:opacity-[0.12] disabled:cursor-default shrink-0"
				style={{ color: arrowColor() }}
			>
				<svg
					class="w-5 h-5"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
			</button>

			{/* Book cover */}
			<div
				style={{
					background: coverGradient(),
					padding: "8px",
					"border-radius": "8px 14px 14px 8px",
					"box-shadow":
						"0 30px 60px -15px rgba(0,0,0,0.35), 0 12px 24px -8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
				}}
			>
				{/* Pages spread */}
				<div
					data-spread
					class="flex"
					style={{
						height: "min(80vh, 700px)",
						width: "min(85vw, 900px)",
					}}
				>
					{/* ── LEFT PAGE ── */}
					<div
						class="flex-1 relative overflow-hidden"
						style={{
							background: pageColor(),
							"border-radius": "4px 0 0 4px",
						}}
					>
						{gutterShadow("left")}

						<div class="relative z-0 h-full">
							<Switch>
								<Match when={mode() === "glossary"}>
									<div
										class="h-full px-8 py-10 overflow-y-auto"
										style={{
											color: textColor(),
											"scrollbar-width": "thin",
											"scrollbar-color": `${isLeather() ? "#c4a96a" : "#e8a0bc"} transparent`,
										}}
									>
										<Show when={glossaryPage() === 0}>
											<h1
												class={`text-2xl font-serif font-bold ${headingColor()} mb-1`}
											>
												Contents
											</h1>
											<p
												class={`text-[11px] font-sans tracking-wide ${subtextColor()}`}
											>
												Developer Diary
											</p>
											<hr
												class={`${hrColor()} my-5`}
											/>
										</Show>
										<For each={currentSpread().left}>
											{(item) => glossaryRow(item)}
										</For>
									</div>
								</Match>

								<Match when={mode() === "entry"}>
									<div
										class="h-full px-8 py-8 flex flex-col"
										style={{ color: textColor() }}
									>
										{/* Back to index */}
										<button
											onClick={goToGlossary}
											class="text-xs font-sans opacity-35 hover:opacity-70 transition-opacity cursor-pointer flex items-center gap-1.5 self-start"
										>
											<svg
												class="w-3 h-3"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M15 19l-7-7 7-7"
												/>
											</svg>
											Index
										</button>

										{/* Centered date & metadata */}
										<div class="flex-1 flex flex-col items-center justify-center text-center gap-4 px-4">
											<div>
												<div class="text-sm font-sans tracking-[0.25em] uppercase opacity-40 mb-2">
													{new Date(
														selectedDate() +
															"T12:00:00"
													).toLocaleDateString(
														"en-US",
														{ weekday: "long" }
													)}
												</div>
												<h1
													class={`text-2xl font-serif font-bold ${headingColor()}`}
												>
													{new Date(
														selectedDate() +
															"T12:00:00"
													).toLocaleDateString(
														"en-US",
														{
															month: "long",
															day: "numeric",
															year: "numeric",
														}
													)}
												</h1>
											</div>

											<hr
												class={`w-16 ${hrColor()}`}
											/>

											<Show when={currentEntry()}>
												{(entry) => (
													<>
														<div class="flex flex-wrap justify-center gap-1.5 max-w-[90%]">
															<For
																each={
																	entry()
																		.projects
																}
															>
																{(project) => (
																	<ProjectBadge
																		name={
																			project
																		}
																	/>
																)}
															</For>
														</div>
														<Show
															when={extractPromptCount(
																entry().content
															)}
														>
															{(count) => (
																<div class="text-xs font-sans opacity-30 mt-1">
																	{count()}{" "}
																	prompts
																</div>
															)}
														</Show>
													</>
												)}
											</Show>
										</div>
									</div>
								</Match>
							</Switch>
						</div>
					</div>

					{/* ── SPINE ── */}
					<div
						class="w-[10px] shrink-0 relative"
						style={{ background: spineGradient() }}
					>
						<div
							class="absolute inset-0"
							style={{
								background:
									"linear-gradient(to right, transparent 10%, rgba(255,255,255,0.25) 35%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.25) 65%, transparent 90%)",
							}}
						/>
						<div class="absolute inset-x-0 inset-y-4 flex flex-col justify-between items-center opacity-20">
							<For each={Array.from({ length: 12 })}>
								{() => (
									<div
										class="w-1 h-1 rounded-full"
										style={{
											background: isLeather()
												? "#f5e6c8"
												: "#fff0f5",
										}}
									/>
								)}
							</For>
						</div>
					</div>

					{/* ── RIGHT PAGE ── */}
					<div
						class="flex-1 relative overflow-hidden"
						style={{
							background: pageColor(),
							"border-radius": "0 4px 4px 0",
						}}
					>
						{gutterShadow("right")}

						<div class="relative z-0 h-full">
							<Switch>
								<Match when={mode() === "glossary"}>
									<div
										class="h-full px-8 py-10 overflow-y-auto"
										style={{
											color: textColor(),
											"scrollbar-width": "thin",
											"scrollbar-color": `${isLeather() ? "#c4a96a" : "#e8a0bc"} transparent`,
										}}
									>
										<Show
											when={
												currentSpread().right.length > 0
											}
											fallback={
												<div class="h-full flex items-center justify-center">
													<span
														class="font-serif text-2xl opacity-10"
														style={{
															color: textColor(),
														}}
													>
														~
													</span>
												</div>
											}
										>
											<For each={currentSpread().right}>
												{(item) => glossaryRow(item)}
											</For>
										</Show>
									</div>
								</Match>

								<Match when={mode() === "entry"}>
									<Show
										when={currentEntry()}
										fallback={
											<div
												class="h-full flex items-center justify-center opacity-30 font-serif"
												style={{ color: textColor() }}
											>
												No entry for this day
											</div>
										}
									>
										{(entry) => (
											<div
												class="h-full overflow-y-auto px-10 py-10"
												style={{
													color: textColor(),
													"scrollbar-width": "thin",
													"scrollbar-color":
														isLeather()
															? "#c4a96a #f5f0e8"
															: "#e8a0bc #fff5f9",
												}}
											>
												<div
													class="font-serif text-[0.95rem] leading-[1.75]"
													innerHTML={renderMarkdown(
														entry().content
													).join("")}
												/>
											</div>
										)}
									</Show>
								</Match>
							</Switch>
						</div>
					</div>
				</div>
			</div>

			{/* Right arrow */}
			<button
				onClick={handleNext}
				disabled={!canGoNext()}
				class="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer opacity-40 hover:opacity-80 disabled:opacity-[0.12] disabled:cursor-default shrink-0"
				style={{ color: arrowColor() }}
			>
				<svg
					class="w-5 h-5"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M9 5l7 7-7 7"
					/>
				</svg>
			</button>
		</div>
	);
}
