import { createMemo, For, onMount, Show } from "solid-js";
import gsap from "gsap";
import { theme, selectedDate, setSelectedDate } from "@/lib/store";
import { getEntries, getEntryByDate } from "@/lib/entries";

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
		colors[props.name] || "bg-neutral-100 text-neutral-600 border-neutral-200";

	return (
		<span
			class={`text-xs px-2 py-0.5 rounded-full border font-sans ${colorClass()}`}
		>
			{props.name}
		</span>
	);
}

function DayTab(props: { date: string; label: string; dayName: string }) {
	const isActive = () => selectedDate() === props.date;
	const isLeather = () => theme() === "leather";

	return (
		<button
			onClick={() => setSelectedDate(props.date)}
			class={`px-3 py-2.5 text-left transition-all duration-200 cursor-pointer rounded-md ${
				isActive()
					? isLeather()
						? "bg-amber-900/12 text-amber-900 font-medium"
						: "bg-pink-500/12 text-pink-900 font-medium"
					: isLeather()
						? "text-amber-800/45 hover:text-amber-900 hover:bg-amber-900/5"
						: "text-pink-500/50 hover:text-pink-800 hover:bg-pink-500/5"
			}`}
		>
			<div class="text-[10px] font-sans uppercase tracking-widest opacity-50">
				{props.dayName}
			</div>
			<div class="text-sm font-serif">{props.label}</div>
		</button>
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

export default function DiaryView() {
	let containerRef!: HTMLDivElement;

	const entries = getEntries();
	const currentEntry = createMemo(() => getEntryByDate(selectedDate()));

	const isLeather = () => theme() === "leather";

	const pageColor = () => (isLeather() ? "#f5f0e8" : "#fff5f9");
	const textColor = () => (isLeather() ? "#2c1810" : "#4a1a2e");

	const headingColor = () =>
		isLeather() ? "text-[#5c3a0a]" : "text-[#a04468]";

	const hrColor = () =>
		isLeather() ? "border-[#d4c5a9]" : "border-[#f0c6d8]";

	const coverGradient = () =>
		isLeather()
			? "linear-gradient(135deg, #5c3a0a 0%, #7a5218 40%, #5c3a0a 100%)"
			: "linear-gradient(135deg, #c4607e 0%, #d4789b 40%, #c4607e 100%)";

	const spineGradient = () =>
		isLeather()
			? "linear-gradient(to right, #4a2e08, #6b4510, #8b6914, #6b4510, #4a2e08)"
			: "linear-gradient(to right, #b8567a, #d4789b, #e8a0bc, #d4789b, #b8567a)";

	const bgColor = () => (isLeather() ? "#ddd5c8" : "#f0e0e8");

	onMount(() => {
		gsap.fromTo(
			containerRef,
			{ opacity: 0, scale: 0.95 },
			{ opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }
		);
	});

	function navigateDay(dir: -1 | 1) {
		const dates = entries.map((e) => e.date);
		const idx = dates.indexOf(selectedDate());
		const next = dates[idx + dir];
		if (!next) return;

		const page = containerRef.querySelector("[data-page]") as HTMLElement;
		if (!page) {
			setSelectedDate(next);
			return;
		}

		const tl = gsap.timeline({
			onComplete: () => {
				setSelectedDate(next);
				gsap.fromTo(
					page,
					{
						rotateY: dir === 1 ? -12 : 12,
						opacity: 0.6,
					},
					{
						rotateY: 0,
						opacity: 1,
						duration: 0.35,
						ease: "power2.out",
					}
				);
			},
		});

		tl.to(page, {
			rotateY: dir === 1 ? 12 : -12,
			opacity: 0.6,
			duration: 0.25,
			ease: "power2.in",
		});
	}

	return (
		<div
			ref={containerRef}
			class="flex items-center justify-center h-full select-none"
			style={{ background: bgColor() }}
		>
			{/* Book cover frame */}
			<div
				class="relative"
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
					class="flex"
					style={{
						height: "min(82vh, 720px)",
						width: "min(90vw, 960px)",
					}}
				>
					{/* LEFT PAGE — Table of Contents */}
					<div
						class="w-[260px] shrink-0 relative flex flex-col overflow-hidden"
						style={{
							background: pageColor(),
							color: textColor(),
							"border-radius": "4px 0 0 4px",
						}}
					>
						{/* Gutter shadow (spine side) */}
						<div
							class="absolute inset-y-0 right-0 w-16 pointer-events-none z-10"
							style={{
								background:
									"linear-gradient(to left, rgba(0,0,0,0.07) 0%, rgba(0,0,0,0.02) 40%, transparent 100%)",
							}}
						/>

						{/* Page content */}
						<div class="relative z-0 px-8 pt-10 pb-6 flex flex-col h-full">
							<h2
								class={`text-xl font-serif font-bold ${headingColor()} mb-0.5`}
							>
								March 2026
							</h2>
							<p
								class={`text-[11px] font-sans tracking-wide ${
									isLeather()
										? "text-amber-700/40"
										: "text-pink-400/50"
								}`}
							>
								Developer Diary
							</p>
							<hr class={`${hrColor()} my-5`} />

							<div class="flex flex-col gap-0.5">
								<DayTab
									date="2026-03-16"
									dayName="Monday"
									label="March 16"
								/>
								<DayTab
									date="2026-03-17"
									dayName="Tuesday"
									label="March 17"
								/>
								<DayTab
									date="2026-03-18"
									dayName="Wednesday"
									label="March 18"
								/>
								<DayTab
									date="2026-03-19"
									dayName="Thursday"
									label="March 19"
								/>
								<DayTab
									date="2026-03-20"
									dayName="Friday"
									label="March 20"
								/>
							</div>
						</div>
					</div>

					{/* SPINE */}
					<div
						class="w-[10px] shrink-0 relative"
						style={{ background: spineGradient() }}
					>
						{/* Spine highlight */}
						<div
							class="absolute inset-0"
							style={{
								background:
									"linear-gradient(to right, transparent 10%, rgba(255,255,255,0.25) 35%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.25) 65%, transparent 90%)",
							}}
						/>
						{/* Spine stitching dots */}
						<div
							class="absolute inset-x-0 inset-y-4 flex flex-col justify-between items-center opacity-20"
						>
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

					{/* RIGHT PAGE — Entry Content */}
					<div
						class="flex-1 relative overflow-hidden"
						style={{
							background: pageColor(),
							color: textColor(),
							"border-radius": "0 4px 4px 0",
							perspective: "1200px",
						}}
					>
						{/* Gutter shadow (spine side) */}
						<div
							class="absolute inset-y-0 left-0 w-16 pointer-events-none z-10"
							style={{
								background:
									"linear-gradient(to right, rgba(0,0,0,0.07) 0%, rgba(0,0,0,0.02) 40%, transparent 100%)",
							}}
						/>

						<Show
							when={currentEntry()}
							fallback={
								<div class="flex items-center justify-center h-full opacity-40 font-serif text-lg">
									No entry for this day
								</div>
							}
						>
							{(entry) => (
								<div
									data-page
									class="h-full overflow-y-auto px-12 py-10 relative z-0"
									style={{
										"transform-origin": "left center",
										"scrollbar-width": "thin",
										"scrollbar-color": isLeather()
											? "#c4a96a #f5f0e8"
											: "#e8a0bc #fff5f9",
									}}
								>
									{/* Header */}
									<div class="mb-6">
										<h1
											class={`text-2xl font-serif font-bold ${headingColor()}`}
										>
											{entry().title}
										</h1>
										<hr class={`mt-3 ${hrColor()}`} />
									</div>

									{/* Project badges */}
									<div class="flex flex-wrap gap-1.5 mb-6">
										<For each={entry().projects}>
											{(project) => (
												<ProjectBadge name={project} />
											)}
										</For>
									</div>

									{/* Entry content */}
									<div
										class="font-serif text-[0.95rem] leading-[1.75]"
										innerHTML={renderMarkdown(
											entry().content
										).join("")}
									/>

									{/* Page navigation */}
									<div class="flex justify-between items-center mt-8 pt-6 border-t border-current/10">
										<button
											onClick={() => navigateDay(-1)}
											class={`text-sm font-sans px-3 py-1.5 rounded transition-colors cursor-pointer ${
												isLeather()
													? "text-amber-800/50 hover:text-amber-800 hover:bg-amber-900/8"
													: "text-pink-600/50 hover:text-pink-700 hover:bg-pink-200/20"
											}`}
										>
											Previous day
										</button>
										<button
											onClick={() => navigateDay(1)}
											class={`text-sm font-sans px-3 py-1.5 rounded transition-colors cursor-pointer ${
												isLeather()
													? "text-amber-800/50 hover:text-amber-800 hover:bg-amber-900/8"
													: "text-pink-600/50 hover:text-pink-700 hover:bg-pink-200/20"
											}`}
										>
											Next day
										</button>
									</div>
								</div>
							)}
						</Show>
					</div>
				</div>
			</div>
		</div>
	);
}
