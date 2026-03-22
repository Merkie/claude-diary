import gsap from "gsap";
import { setTheme, setView, type Theme } from "@/lib/store";

export default function JournalSelect() {
	let containerRef!: HTMLDivElement;
	let leatherRef!: HTMLButtonElement;
	let pinkRef!: HTMLButtonElement;

	function pickJournal(picked: Theme) {
		const chosen = picked === "leather" ? leatherRef : pinkRef;
		const other = picked === "leather" ? pinkRef : leatherRef;

		const tl = gsap.timeline({
			onComplete: () => {
				setTheme(picked);
				setView("diary");
			},
		});

		tl.to(other, {
			opacity: 0,
			scale: 0.9,
			y: 20,
			duration: 0.35,
			ease: "power2.in",
		});

		tl.to(
			chosen,
			{
				scale: 1.1,
				duration: 0.3,
				ease: "power2.out",
			},
			"-=0.1"
		);

		tl.to(chosen, {
			scale: 12,
			opacity: 0,
			duration: 0.6,
			ease: "power2.in",
		});

		tl.to(
			containerRef,
			{
				opacity: 0,
				duration: 0.3,
			},
			"-=0.4"
		);
	}

	return (
		<div
			ref={containerRef}
			class="flex flex-col items-center justify-center h-full gap-12 select-none bg-white"
		>
			<div class="text-center">
				<h1 class="text-3xl font-serif font-bold text-neutral-800 tracking-wide animate-journal-title">
					Claude Diary
				</h1>
				<p class="text-sm text-neutral-400 mt-2 font-sans animate-journal-subtitle">
					Choose your journal
				</p>
			</div>

			<div class="flex items-center gap-16">
				<button
					ref={leatherRef}
					onClick={() => pickJournal("leather")}
					class="cursor-pointer transition-transform duration-200 hover:-translate-y-2 focus:outline-none animate-journal-pop-1"
				>
					<img
						src="/assets/leather-journal.webp"
						alt="Leather journal"
						class="h-80"
						draggable={false}
					/>
				</button>

				<button
					ref={pinkRef}
					onClick={() => pickJournal("pink")}
					class="cursor-pointer transition-transform duration-200 hover:-translate-y-2 focus:outline-none animate-journal-pop-2"
				>
					<img
						src="/assets/pink-journal.webp"
						alt="Pink journal"
						class="h-80"
						draggable={false}
					/>
				</button>
			</div>
		</div>
	);
}
