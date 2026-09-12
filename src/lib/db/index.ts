import Dexie, { type Table } from 'dexie';
import type { Track, Playlist, FavoriteEntry, HistoryEntry, UserSettings } from '$lib/types/music';

// Catálogo inicial curado com faixas reais de alta fidelidade no YouTube
export const INITIAL_CURATED_TRACKS: Track[] = [
	{
		id: 'fJ9rUzIMcZQ',
		title: 'Bohemian Rhapsody',
		artist: 'Queen',
		thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
		duration: '5:59',
		durationSec: 359,
		album: 'A Night at the Opera'
	},
	{
		id: '4NRXx6U8ABQ',
		title: 'Blinding Lights',
		artist: 'The Weeknd',
		thumbnail: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg',
		duration: '3:20',
		durationSec: 200,
		album: 'After Hours'
	},
	{
		id: '5qap5aO4i9A',
		title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
		artist: 'Lofi Girl',
		thumbnail: 'https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg',
		duration: 'Live',
		durationSec: 3600,
		album: 'Lofi Beats'
	},
	{
		id: 'hT_nvWreIhg',
		title: 'Counting Stars',
		artist: 'OneRepublic',
		thumbnail: 'https://i.ytimg.com/vi/hT_nvWreIhg/hqdefault.jpg',
		duration: '4:17',
		durationSec: 257,
		album: 'Native'
	},
	{
		id: 'yKNxeF4KMsY',
		title: 'Coldplay - Yellow',
		artist: 'Coldplay',
		thumbnail: 'https://i.ytimg.com/vi/yKNxeF4KMsY/hqdefault.jpg',
		duration: '4:29',
		durationSec: 269,
		album: 'Parachutes'
	},
	{
		id: 'L3wKzyIN1yk',
		title: 'Feel Good Inc.',
		artist: 'Gorillaz',
		thumbnail: 'https://i.ytimg.com/vi/L3wKzyIN1yk/hqdefault.jpg',
		duration: '3:43',
		durationSec: 223,
		album: 'Demon Days'
	},
	{
		id: 'nfWlot6h_JM',
		title: 'Shake It Off',
		artist: 'Taylor Swift',
		thumbnail: 'https://i.ytimg.com/vi/nfWlot6h_JM/hqdefault.jpg',
		duration: '3:39',
		durationSec: 219,
		album: '1989'
	},
	{
		id: 'JGwWNGJdvx8',
		title: 'Shape of You',
		artist: 'Ed Sheeran',
		thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg',
		duration: '3:53',
		durationSec: 233,
		album: 'Divide'
	}
];

export class SoniqDatabase extends Dexie {
	playlists!: Table<Playlist, string>;
	favorites!: Table<FavoriteEntry, string>;
	history!: Table<HistoryEntry, number>;
	settings!: Table<UserSettings, number>;

	constructor() {
		super('SoniqDB');
		this.version(1).stores({
			playlists: 'id, name, createdAt, updatedAt',
			favorites: 'id, addedAt',
			history: '++id, trackId, playedAt, playCount',
			settings: '++id'
		});
	}
}

export const db = new SoniqDatabase();

// Inicialização com dados padrão caso o banco esteja vazio
export async function initializeDatabase() {
	try {
		const playlistCount = await db.playlists.count();
		if (playlistCount === 0) {
			const now = Date.now();
			await db.playlists.bulkAdd([
				{
					id: 'playlist-top-hits',
					name: 'Top Hits Soniq',
					description: 'As melhores faixas curadas para começar a ouvir no Soniq.',
					color: 'from-indigo-600 to-cyan-500',
					tracks: INITIAL_CURATED_TRACKS.slice(0, 4),
					createdAt: now,
					updatedAt: now
				},
				{
					id: 'playlist-chill-vibes',
					name: 'Chill & Relax',
					description: 'Músicas para relaxar, trabalhar e estudar com tranquilidade.',
					color: 'from-purple-600 to-pink-500',
					tracks: INITIAL_CURATED_TRACKS.slice(2, 6),
					createdAt: now - 1000,
					updatedAt: now - 1000
				},
				{
					id: 'playlist-rock-classics',
					name: 'Rock Classics',
					description: 'Grandes sucessos do rock para elevar a energia.',
					color: 'from-amber-600 to-rose-600',
					tracks: [INITIAL_CURATED_TRACKS[0], INITIAL_CURATED_TRACKS[4], INITIAL_CURATED_TRACKS[5]],
					createdAt: now - 2000,
					updatedAt: now - 2000
				}
			]);
		}

		// Garante configurações padrão
		const settingsCount = await db.settings.count();
		if (settingsCount === 0) {
			await db.settings.add({
				theme: 'dark',
				volume: 80,
				isMuted: false,
				repeatMode: 'off',
				shuffle: false
			});
		}
	} catch (error) {
		console.error('Erro ao inicializar banco de dados Soniq:', error);
	}
}

// Métodos de Playlists
export async function getPlaylists(): Promise<Playlist[]> {
	return await db.playlists.orderBy('updatedAt').reverse().toArray();
}

export async function getPlaylist(id: string): Promise<Playlist | undefined> {
	return await db.playlists.get(id);
}

export async function createPlaylist(name: string, description = '', color = 'from-indigo-600 to-cyan-500'): Promise<Playlist> {
	const now = Date.now();
	const newPlaylist: Playlist = {
		id: 'pl-' + Math.random().toString(36).substring(2, 10),
		name,
		description,
		color,
		tracks: [],
		createdAt: now,
		updatedAt: now
	};
	await db.playlists.add(newPlaylist);
	return newPlaylist;
}

export async function updatePlaylist(id: string, updates: Partial<Playlist>): Promise<void> {
	await db.playlists.update(id, {
		...updates,
		updatedAt: Date.now()
	});
}

export async function deletePlaylist(id: string): Promise<void> {
	await db.playlists.delete(id);
}

export async function addTrackToPlaylist(playlistId: string, track: Track): Promise<boolean> {
	const playlist = await db.playlists.get(playlistId);
	if (!playlist) return false;
	
	// Evita duplicar se já existir
	if (playlist.tracks.some(t => t.id === track.id)) {
		return false;
	}

	playlist.tracks.push({
		...track,
		addedAt: Date.now()
	});
	playlist.updatedAt = Date.now();
	await db.playlists.put(playlist);
	return true;
}

export async function removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<void> {
	const playlist = await db.playlists.get(playlistId);
	if (!playlist) return;

	playlist.tracks = playlist.tracks.filter(t => t.id !== trackId);
	playlist.updatedAt = Date.now();
	await db.playlists.put(playlist);
}

// Métodos de Favoritos
export async function getFavorites(): Promise<Track[]> {
	const entries = await db.favorites.orderBy('addedAt').reverse().toArray();
	return entries.map(e => e.track);
}

export async function isFavorite(trackId: string): Promise<boolean> {
	const entry = await db.favorites.get(trackId);
	return !!entry;
}

export async function toggleFavorite(track: Track): Promise<boolean> {
	const exists = await isFavorite(track.id);
	let result = false;
	if (exists) {
		await db.favorites.delete(track.id);
		result = false;
	} else {
		await db.favorites.put({
			id: track.id,
			track,
			addedAt: Date.now()
		});
		result = true;
	}

	if (typeof window !== 'undefined') {
		window.dispatchEvent(new CustomEvent('soniq-favorites-updated', { detail: { track, isFav: result } }));
		window.dispatchEvent(new CustomEvent('soniq-playlists-updated'));
	}
	return result;
}

// Métodos de Histórico
export async function getHistory(limit = 50): Promise<HistoryEntry[]> {
	return await db.history.orderBy('playedAt').reverse().limit(limit).toArray();
}

export async function recordTrackPlay(track: Track): Promise<void> {
	const existing = await db.history.where('trackId').equals(track.id).first();
	const now = Date.now();
	if (existing && existing.id) {
		await db.history.update(existing.id, {
			playedAt: now,
			playCount: existing.playCount + 1,
			track
		});
	} else {
		await db.history.add({
			trackId: track.id,
			track,
			playedAt: now,
			playCount: 1
		});
	}
}

// Métodos de Configurações
export async function getSettings(): Promise<UserSettings> {
	let localKey = '';
	let localTheme: 'dark' | 'light' = 'dark';
	if (typeof window !== 'undefined' && window.localStorage) {
		localKey = localStorage.getItem('soniq_yt_api_key') || '';
		localTheme = (localStorage.getItem('soniq_theme') as 'dark' | 'light') || 'dark';
	}

	const settings = await db.settings.get(1);
	if (settings) {
		if (localKey && !settings.youtubeApiKey) {
			settings.youtubeApiKey = localKey;
			await db.settings.update(1, { youtubeApiKey: localKey });
		}
		return settings;
	}

	const initial: UserSettings = {
		id: 1,
		youtubeApiKey: localKey,
		theme: localTheme,
		volume: 80,
		isMuted: false,
		repeatMode: 'off',
		shuffle: false
	};
	await db.settings.put(initial);
	return initial;
}

export async function saveSettings(updates: Partial<UserSettings>): Promise<void> {
	if (typeof window !== 'undefined' && window.localStorage) {
		if (updates.youtubeApiKey !== undefined) {
			localStorage.setItem('soniq_yt_api_key', updates.youtubeApiKey);
		}
		if (updates.theme !== undefined) {
			localStorage.setItem('soniq_theme', updates.theme);
		}
	}

	const current = (await db.settings.get(1)) || {
		id: 1,
		theme: 'dark',
		volume: 80,
		isMuted: false,
		repeatMode: 'off',
		shuffle: false
	};

	await db.settings.put({
		...current,
		...updates,
		id: 1
	});
}
