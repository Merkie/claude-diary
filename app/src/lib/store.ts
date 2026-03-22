import { createSignal } from "solid-js";

export type Theme = "leather" | "pink";
export type AppView = "select" | "diary";

const [theme, setTheme] = createSignal<Theme | null>(null);
const [view, setView] = createSignal<AppView>("select");
const [selectedDate, setSelectedDate] = createSignal("2026-03-16");

export { theme, setTheme, view, setView, selectedDate, setSelectedDate };
