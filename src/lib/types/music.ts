export interface Track {
	id: string; // YouTube Video ID
	title: string;
	artist: string;
	thumbnail: string;
	duration: string; // Ex: "3:45"
	durationSec: number;
	album?: string;
	addedAt?: number;
}

export interface Playlist {
	id: string;
	name: string;
	description?: string;
	color: string; // Gradiente ou cor hex para capa
	tracks: Track[];
	createdAt: number;
	updatedAt: number;
}

export interface FavoriteEntry {
	id: string; // YouTube Video ID
	track: Track;
	addedAt: number;
}

export interface HistoryEntry {
	id?: number;
	trackId: string;
	track: Track;
	playedAt: number;
	playCount: number;
}

export interface UserSettings {
	id?: number;
	youtubeApiKey?: string;
	theme: 'dark' | 'light';
	volume: number;
	isMuted: boolean;
	lastTrack?: Track;
	lastPosition?: number;
	repeatMode: 'off' | 'all' | 'one';
	shuffle: boolean;
}

export type RepeatMode = 'off' | 'all' | 'one';
