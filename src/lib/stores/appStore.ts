import { writable } from 'svelte/store';
import type { Playlist, Track } from '$lib/types/music';
import { getSettings, saveSettings } from '$lib/db';
import { EMBEDDED_API_KEY } from '$lib/services/youtubeApi';

export const themeStore = writable<'dark' | 'light'>(
	typeof window !== 'undefined' ? (localStorage.getItem('soniq_theme') as 'dark' | 'light') || 'dark' : 'dark'
);
export const apiKeyStore = writable<string>(
	(typeof window !== 'undefined' ? localStorage.getItem('soniq_yt_api_key') : '') || EMBEDDED_API_KEY
);

export const isSettingsOpen = writable<boolean>(false);
export const isPlaylistModalOpen = writable<boolean>(false);
export const playlistEditing = writable<Playlist | null>(null);

export const isAddToPlaylistOpen = writable<boolean>(false);
export const trackForPlaylist = writable<Track | null>(null);

export async function initAppTheme() {
	if (typeof window === 'undefined') return;
	const settings = await getSettings();
	const theme = settings.theme || 'dark';
	themeStore.set(theme);
	apiKeyStore.set(settings.youtubeApiKey || '');
	applyTheme(theme);
}

export function toggleTheme() {
	themeStore.update((curr) => {
		const next = curr === 'dark' ? 'light' : 'dark';
		applyTheme(next);
		saveSettings({ theme: next });
		return next;
	});
}

function applyTheme(theme: 'dark' | 'light') {
	if (typeof document === 'undefined') return;
	const root = document.documentElement;
	if (theme === 'dark') {
		root.classList.add('dark');
		root.classList.remove('light');
	} else {
		root.classList.add('light');
		root.classList.remove('dark');
	}
}

export function openPlaylistModal(playlist?: Playlist) {
	playlistEditing.set(playlist || null);
	isPlaylistModalOpen.set(true);
}

export function closePlaylistModal() {
	isPlaylistModalOpen.set(false);
	playlistEditing.set(null);
}

export function openAddToPlaylist(track: Track) {
	trackForPlaylist.set(track);
	isAddToPlaylistOpen.set(true);
}

export function closeAddToPlaylist() {
	isAddToPlaylistOpen.set(false);
	trackForPlaylist.set(null);
}
