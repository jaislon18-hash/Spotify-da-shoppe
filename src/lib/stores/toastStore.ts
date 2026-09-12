import { writable } from 'svelte/store';

export interface Toast {
	id: string;
	message: string;
	type: 'info' | 'success' | 'warning' | 'error';
}

export const toasts = writable<Toast[]>([]);

export function showToast(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
	const id = Math.random().toString(36).substring(2, 9);
	toasts.update((all) => [...all, { id, message, type }]);

	setTimeout(() => {
		toasts.update((all) => all.filter((t) => t.id !== id));
	}, 3500);
}
