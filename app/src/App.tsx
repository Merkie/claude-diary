import { Match, Switch } from "solid-js";
import { view } from "@/lib/store";
import JournalSelect from "@/components/JournalSelect";
import DiaryView from "@/components/DiaryView";

export default function App() {
	return (
		<div class="h-full bg-white">
			<Switch>
				<Match when={view() === "select"}>
					<JournalSelect />
				</Match>
				<Match when={view() === "diary"}>
					<DiaryView />
				</Match>
			</Switch>
		</div>
	);
}
