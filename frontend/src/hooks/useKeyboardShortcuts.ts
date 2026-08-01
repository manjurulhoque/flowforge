import { useEffect } from "react";
import { useEditorStore } from "@/store/editorStore";

function isTypingTarget(el: EventTarget | null): boolean {
	if (!(el instanceof HTMLElement)) return false;
	const tag = el.tagName;
	return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

/** Global editor shortcuts. Ignored while typing in form fields. */
export function useKeyboardShortcuts() {
	const store = useEditorStore;

	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (isTypingTarget(e.target)) return;
			const mod = e.metaKey || e.ctrlKey;
			const s = store.getState();

			if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
				e.preventDefault();
				s.undo();
			} else if (
				mod &&
				(e.key.toLowerCase() === "y" ||
					(e.key.toLowerCase() === "z" && e.shiftKey))
			) {
				e.preventDefault();
				s.redo();
			} else if (mod && e.key.toLowerCase() === "c") {
				s.copy();
			} else if (mod && e.key.toLowerCase() === "v") {
				e.preventDefault();
				s.paste();
			} else if (mod && e.key.toLowerCase() === "d") {
				e.preventDefault();
				s.duplicateSelected();
			} else if (mod && e.key.toLowerCase() === "a") {
				e.preventDefault();
				s.selectAll();
			} else if (e.key === "Delete" || e.key === "Backspace") {
				e.preventDefault();
				s.deleteSelected();
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [store]);
}
