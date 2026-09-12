import { writable, get } from 'svelte/store';
import type { Track, RepeatMode } from '$lib/types/music';
import { recordTrackPlay, saveSettings, isFavorite, toggleFavorite as dbToggleFavorite } from '$lib/db';
import { showToast } from '$lib/stores/toastStore';

export interface PlayerState {
	currentTrack: Track | null;
	isPlaying: boolean;
	isBuffering: boolean;
	currentTime: number; // segundos
	duration: number; // segundos
	progressPercent: number; // 0 - 100
	volume: number; // 0 - 100
	isMuted: boolean;
	repeatMode: RepeatMode;
	isShuffle: boolean;
	queue: Track[];
	originalQueue: Track[];
	queueIndex: number;
	isVideoVisible: boolean;
	isQueueOpen: boolean;
	isMobileExpanded: boolean;
	isCurrentFavorite: boolean;
}

const initialState: PlayerState = {
	currentTrack: null,
	isPlaying: false,
	isBuffering: false,
	currentTime: 0,
	duration: 0,
	progressPercent: 0,
	volume: 80,
	isMuted: false,
	repeatMode: 'off',
	isShuffle: false,
	queue: [],
	originalQueue: [],
	queueIndex: -1,
	isVideoVisible: false,
	isQueueOpen: false,
	isMobileExpanded: false,
	isCurrentFavorite: false
};

export const playerStore = writable<PlayerState>(initialState);

// Referência interna ao player oficial do YouTube
let ytPlayer: any = null;
let timeUpdateInterval: any = null;
let lastRecordedTrackId: string | null = null;

// Áudio silencioso em loop contínuo para manter a sessão de mídia do navegador (Android/iOS) ativa em segundo plano
const SILENT_AUDIO_URI =
	'data:audio/wav;base64,UklGRkQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==';

let silentAudioEl: HTMLAudioElement | null = null;
let userInitiatedPause = false;
let backgroundResumeTimeout: any = null;
let mediaSessionInitialized = false;

function getSilentAudio(): HTMLAudioElement | null {
	if (typeof window === 'undefined') return null;
	if (!silentAudioEl) {
		silentAudioEl = new Audio(SILENT_AUDIO_URI);
		silentAudioEl.loop = true;
		silentAudioEl.volume = 0.001;
	}
	return silentAudioEl;
}

export function startSilentAudio() {
	try {
		const audio = getSilentAudio();
		if (audio && audio.paused) {
			const p = audio.play();
			if (p !== undefined) {
				p.catch(() => {});
			}
		}
	} catch (e) {}
}

export function stopSilentAudio() {
	try {
		if (silentAudioEl && !silentAudioEl.paused) {
			silentAudioEl.pause();
		}
	} catch (e) {}
}

function initMediaSession() {
	if (typeof window === 'undefined' || !('mediaSession' in navigator) || mediaSessionInitialized) return;
	mediaSessionInitialized = true;

	try {
		navigator.mediaSession.setActionHandler('play', () => {
			play();
		});
		navigator.mediaSession.setActionHandler('pause', () => {
			pause();
		});
		navigator.mediaSession.setActionHandler('previoustrack', () => {
			playPrevious();
		});
		navigator.mediaSession.setActionHandler('nexttrack', () => {
			playNext();
		});
		navigator.mediaSession.setActionHandler('seekto', (details) => {
			if (details.seekTime !== undefined) {
				seekTo(details.seekTime);
			}
		});
		navigator.mediaSession.setActionHandler('seekforward', (details) => {
			const st = get(playerStore);
			const step = details.seekOffset || 10;
			seekTo(Math.min(st.duration, st.currentTime + step));
		});
		navigator.mediaSession.setActionHandler('seekbackward', (details) => {
			const st = get(playerStore);
			const step = details.seekOffset || 10;
			seekTo(Math.max(0, st.currentTime - step));
		});
		navigator.mediaSession.setActionHandler('stop', () => {
			pause();
		});
	} catch (err) {
		console.warn('Erro ao inicializar MediaSession:', err);
	}
}

export function updateMediaSessionMetadata(track: Track | null) {
	if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
	if (!track) {
		navigator.mediaSession.playbackState = 'none';
		return;
	}

	initMediaSession();

	try {
		navigator.mediaSession.metadata = new MediaMetadata({
			title: track.title,
			artist: track.artist,
			album: 'Soniq Music',
			artwork: [
				{ src: track.thumbnail, sizes: '96x96', type: 'image/jpeg' },
				{ src: track.thumbnail, sizes: '128x128', type: 'image/jpeg' },
				{ src: track.thumbnail, sizes: '192x192', type: 'image/jpeg' },
				{ src: track.thumbnail, sizes: '256x256', type: 'image/jpeg' },
				{ src: track.thumbnail, sizes: '384x384', type: 'image/jpeg' },
				{ src: track.thumbnail, sizes: '512x512', type: 'image/jpeg' }
			]
		});
		navigator.mediaSession.playbackState = 'playing';
	} catch (e) {
		console.warn('Erro ao atualizar metadata do MediaSession:', e);
	}
}

function updateMediaSessionPositionState() {
	if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
	if (!('setPositionState' in navigator.mediaSession)) return;
	try {
		const st = get(playerStore);
		if (st.duration > 0 && !isNaN(st.duration)) {
			navigator.mediaSession.setPositionState({
				duration: Math.max(1, st.duration),
				playbackRate: 1.0,
				position: Math.min(Math.max(0, st.currentTime), st.duration)
			});
		}
	} catch (e) {}
}

function updateMediaSessionPlaybackState(state: 'playing' | 'paused' | 'none') {
	if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
	try {
		navigator.mediaSession.playbackState = state;
	} catch (e) {}
}

// Ouvinte de mudança de visibilidade (segundo plano no mobile)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
	document.addEventListener('visibilitychange', () => {
		const state = get(playerStore);
		if (document.hidden) {
			if (state.isPlaying && !userInitiatedPause) {
				startSilentAudio();
				setTimeout(() => {
					if (!userInitiatedPause && ytPlayer && typeof ytPlayer.playVideo === 'function') {
						try {
							ytPlayer.playVideo();
						} catch (e) {}
					}
				}, 120);
			}
		} else {
			if (state.isPlaying && !userInitiatedPause) {
				if (ytPlayer && typeof ytPlayer.getPlayerState === 'function') {
					const YT = (window as any).YT;
					if (YT && ytPlayer.getPlayerState() !== YT.PlayerState.PLAYING) {
						try {
							ytPlayer.playVideo();
						} catch (e) {}
					}
				}
			}
		}
	});
}

// Inicializa a YouTube IFrame API
export function initializeYouTubeApi(containerId = 'soniq-yt-iframe'): Promise<boolean> {
	return new Promise((resolve) => {
		if (typeof window === 'undefined') return resolve(false);

		// Callback chamado quando a API do YouTube carrega
		(window as any).onYouTubeIframeAPIReady = () => {
			createYTPlayer(containerId);
			resolve(true);
		};

		// Se a API já estiver carregada
		if ((window as any).YT && (window as any).YT.Player) {
			createYTPlayer(containerId);
			resolve(true);
			return;
		}

		// Adiciona o script oficial
		if (!document.getElementById('yt-iframe-api-script')) {
			const tag = document.createElement('script');
			tag.id = 'yt-iframe-api-script';
			tag.src = 'https://www.youtube.com/iframe_api';
			const firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
		}
	});
}

function createYTPlayer(containerId: string) {
	if (typeof window === 'undefined' || !(window as any).YT) return;
	const container = document.getElementById(containerId);
	if (!container) return;

	try {
		ytPlayer = new (window as any).YT.Player(containerId, {
			height: '100%',
			width: '100%',
			playerVars: {
				autoplay: 1,
				controls: 0,
				disablekb: 1,
				fs: 0,
				rel: 0,
				modestbranding: 1,
				playsinline: 1,
				iv_load_policy: 3
			},
			events: {
				onReady: onPlayerReady,
				onStateChange: onPlayerStateChange,
				onError: onPlayerError
			}
		});
	} catch (e) {
		console.error('Erro ao instanciar YT.Player:', e);
	}
}

function onPlayerReady(event: any) {
	const state = get(playerStore);
	if (state.volume !== undefined) {
		event.target.setVolume(state.volume);
		if (state.isMuted) {
			event.target.mute();
		}
	}
}

function onPlayerStateChange(event: any) {
	const YT = (window as any).YT;
	if (!YT) return;

	const playerState = event.data;

	if (playerState === YT.PlayerState.PLAYING) {
		userInitiatedPause = false;
		playerStore.update((s) => ({ ...s, isPlaying: true, isBuffering: false }));
		startTimeTracker();
		startSilentAudio();
		updateMediaSessionPlaybackState('playing');

		// Registra no histórico ao tocar
		const current = get(playerStore).currentTrack;
		if (current && current.id !== lastRecordedTrackId) {
			lastRecordedTrackId = current.id;
			recordTrackPlay(current);
		}
	} else if (playerState === YT.PlayerState.PAUSED) {
		// Se o celular foi bloqueado ou mudou de app (document.hidden) e o usuário NÃO clicou em pausar:
		if (typeof document !== 'undefined' && document.hidden && !userInitiatedPause) {
			console.log('[Soniq] Retomando áudio em segundo plano...');
			startSilentAudio();
			if (backgroundResumeTimeout) clearTimeout(backgroundResumeTimeout);
			backgroundResumeTimeout = setTimeout(() => {
				if (!userInitiatedPause && ytPlayer && typeof ytPlayer.playVideo === 'function') {
					try {
						ytPlayer.playVideo();
					} catch (e) {}
				}
			}, 100);
			return;
		}

		// Pausa intencional do usuário
		playerStore.update((s) => ({ ...s, isPlaying: false, isBuffering: false }));
		stopTimeTracker();
		stopSilentAudio();
		updateMediaSessionPlaybackState('paused');
	} else if (playerState === YT.PlayerState.BUFFERING) {
		playerStore.update((s) => ({ ...s, isBuffering: true }));
	} else if (playerState === YT.PlayerState.ENDED) {
		stopTimeTracker();
		handleTrackEnded();
	}
}

function onPlayerError(error: any) {
	console.warn('YouTube Player Evento de Erro:', error);
	playerStore.update((s) => ({ ...s, isPlaying: false, isBuffering: false }));
	// Pula para a próxima se houver erro no vídeo
	setTimeout(() => {
		playNext();
	}, 1500);
}

function startTimeTracker() {
	stopTimeTracker();
	timeUpdateInterval = setInterval(() => {
		if (!ytPlayer || typeof ytPlayer.getCurrentTime !== 'function') return;

		try {
			const current = ytPlayer.getCurrentTime() || 0;
			const duration = ytPlayer.getDuration() || 0;
			const progress = duration > 0 ? (current / duration) * 100 : 0;

			playerStore.update((s) => ({
				...s,
				currentTime: current,
				duration: duration || s.duration,
				progressPercent: Math.min(100, Math.max(0, progress))
			}));

			updateMediaSessionPositionState();

			// Salva periodicamente posição para restaurar sessão
			const st = get(playerStore);
			if (st.currentTrack && Math.floor(current) % 5 === 0) {
				saveSettings({
					lastTrack: st.currentTrack,
					lastPosition: current
				});
			}
		} catch (e) {
			// Ignora falhas pontuais de leitura
		}
	}, 500);
}

function stopTimeTracker() {
	if (timeUpdateInterval) {
		clearInterval(timeUpdateInterval);
		timeUpdateInterval = null;
	}
}

function handleTrackEnded() {
	const state = get(playerStore);

	if (state.repeatMode === 'one') {
		seekTo(0);
		play();
		return;
	}

	if (state.queueIndex < state.queue.length - 1) {
		playNext();
	} else if (state.repeatMode === 'all' && state.queue.length > 0) {
		// Reinicia a fila do começo
		playerStore.update((s) => ({ ...s, queueIndex: 0 }));
		updateMediaSessionMetadata(state.queue[0]);
		loadAndPlayTrack(state.queue[0]);
	} else {
		playerStore.update((s) => ({ ...s, isPlaying: false, currentTime: 0, progressPercent: 0 }));
		stopSilentAudio();
		updateMediaSessionPlaybackState('none');
	}
}

// Reproduz uma faixa específica, opcionalmente com nova fila
export async function playTrack(track: Track, newQueue?: Track[]) {
	userInitiatedPause = false;
	const fav = await isFavorite(track.id);

	let q = get(playerStore).queue;
	let orig = get(playerStore).originalQueue;
	let idx = 0;

	if (newQueue && newQueue.length > 0) {
		q = [...newQueue];
		orig = [...newQueue];
		idx = q.findIndex((t) => t.id === track.id);
		if (idx === -1) {
			q.unshift(track);
			orig.unshift(track);
			idx = 0;
		}
	} else {
		idx = q.findIndex((t) => t.id === track.id);
		if (idx === -1) {
			q = [track, ...q];
			orig = [track, ...orig];
			idx = 0;
		}
	}

	playerStore.update((s) => ({
		...s,
		currentTrack: track,
		queue: q,
		originalQueue: orig,
		queueIndex: idx,
		isCurrentFavorite: fav,
		currentTime: 0,
		progressPercent: 0
	}));

	updateMediaSessionMetadata(track);
	startSilentAudio();
	loadAndPlayTrack(track);
}

function loadAndPlayTrack(track: Track) {
	if (!track || !track.id) return;
	userInitiatedPause = false;

	if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
		try {
			ytPlayer.loadVideoById({
				videoId: track.id,
				startSeconds: 0
			});
			play();
		} catch (err) {
			console.error('Erro ao carregar vídeo no player:', err);
		}
	}
}

export function play() {
	userInitiatedPause = false;
	startSilentAudio();
	if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
		try {
			ytPlayer.playVideo();
		} catch (e) {}
	}
	playerStore.update((s) => ({ ...s, isPlaying: true }));
	updateMediaSessionPlaybackState('playing');
}

export function pause() {
	userInitiatedPause = true;
	if (backgroundResumeTimeout) {
		clearTimeout(backgroundResumeTimeout);
		backgroundResumeTimeout = null;
	}
	if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
		try {
			ytPlayer.pauseVideo();
		} catch (e) {}
	}
	playerStore.update((s) => ({ ...s, isPlaying: false }));
	stopTimeTracker();
	stopSilentAudio();
	updateMediaSessionPlaybackState('paused');
}

export function togglePlay() {
	const state = get(playerStore);
	if (!state.currentTrack && state.queue.length > 0) {
		playTrack(state.queue[0]);
		return;
	}
	if (state.isPlaying) {
		pause();
	} else {
		play();
	}
}

export function playNext() {
	const state = get(playerStore);
	if (state.queue.length === 0) return;

	let nextIndex = state.queueIndex + 1;
	if (nextIndex >= state.queue.length) {
		if (state.repeatMode === 'all') {
			nextIndex = 0;
		} else {
			pause();
			return;
		}
	}

	const nextTrack = state.queue[nextIndex];
	if (nextTrack) {
		userInitiatedPause = false;
		playerStore.update((s) => ({ ...s, queueIndex: nextIndex, currentTrack: nextTrack }));
		updateMediaSessionMetadata(nextTrack);
		startSilentAudio();
		isFavorite(nextTrack.id).then((fav) => {
			playerStore.update((s) => ({ ...s, isCurrentFavorite: fav }));
		});
		loadAndPlayTrack(nextTrack);
	}
}

export function playPrevious() {
	const state = get(playerStore);

	// Se já tocou mais de 3 segundos, volta para o início da música atual
	if (state.currentTime > 3) {
		seekTo(0);
		return;
	}

	let prevIndex = state.queueIndex - 1;
	if (prevIndex < 0) {
		if (state.repeatMode === 'all') {
			prevIndex = state.queue.length - 1;
		} else {
			seekTo(0);
			return;
		}
	}

	const prevTrack = state.queue[prevIndex];
	if (prevTrack) {
		userInitiatedPause = false;
		playerStore.update((s) => ({ ...s, queueIndex: prevIndex, currentTrack: prevTrack }));
		updateMediaSessionMetadata(prevTrack);
		startSilentAudio();
		isFavorite(prevTrack.id).then((fav) => {
			playerStore.update((s) => ({ ...s, isCurrentFavorite: fav }));
		});
		loadAndPlayTrack(prevTrack);
	}
}

export function seekTo(seconds: number) {
	if (ytPlayer && typeof ytPlayer.seekTo === 'function') {
		try {
			ytPlayer.seekTo(seconds, true);
		} catch (e) {}
	}
	playerStore.update((s) => {
		const dur = s.duration || 1;
		return {
			...s,
			currentTime: seconds,
			progressPercent: (seconds / dur) * 100
		};
	});
}

export function setVolume(vol: number) {
	const clamped = Math.max(0, Math.min(100, vol));
	if (ytPlayer && typeof ytPlayer.setVolume === 'function') {
		try {
			ytPlayer.setVolume(clamped);
			if (clamped > 0 && ytPlayer.isMuted && ytPlayer.isMuted()) {
				ytPlayer.unMute();
			}
		} catch (e) {}
	}
	playerStore.update((s) => ({ ...s, volume: clamped, isMuted: clamped === 0 }));
	saveSettings({ volume: clamped, isMuted: clamped === 0 });
}

export function toggleMute() {
	const state = get(playerStore);
	const newMuted = !state.isMuted;
	if (ytPlayer) {
		try {
			if (newMuted) {
				ytPlayer.mute();
			} else {
				ytPlayer.unMute();
				if (state.volume === 0) {
					ytPlayer.setVolume(50);
					playerStore.update((s) => ({ ...s, volume: 50 }));
				}
			}
		} catch (e) {}
	}
	playerStore.update((s) => ({ ...s, isMuted: newMuted }));
	saveSettings({ isMuted: newMuted });
}

export function toggleShuffle() {
	playerStore.update((s) => {
		const newShuffle = !s.isShuffle;
		let newQueue = [...s.queue];

		if (newShuffle) {
			// Embaralha preservando a música atual na primeira posição
			const current = s.currentTrack;
			const others = s.queue.filter((t) => t.id !== current?.id);
			for (let i = others.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[others[i], others[j]] = [others[j], others[i]];
			}
			newQueue = current ? [current, ...others] : others;
		} else {
			// Restaura ordem original
			newQueue = [...s.originalQueue];
		}

		const newIdx = newQueue.findIndex((t) => t.id === s.currentTrack?.id);

		saveSettings({ shuffle: newShuffle });
		return {
			...s,
			isShuffle: newShuffle,
			queue: newQueue,
			queueIndex: newIdx >= 0 ? newIdx : 0
		};
	});
}

export function toggleRepeat() {
	playerStore.update((s) => {
		const modes: RepeatMode[] = ['off', 'all', 'one'];
		const nextMode = modes[(modes.indexOf(s.repeatMode) + 1) % modes.length];
		saveSettings({ repeatMode: nextMode });
		return { ...s, repeatMode: nextMode };
	});
}

export function addToQueue(track: Track) {
	playerStore.update((s) => {
		// Não duplica se já for a próxima
		const newQueue = [...s.queue, track];
		const newOrig = [...s.originalQueue, track];
		return {
			...s,
			queue: newQueue,
			originalQueue: newOrig
		};
	});
}

export function removeFromQueue(index: number) {
	playerStore.update((s) => {
		const newQueue = s.queue.filter((_, i) => i !== index);
		let newIdx = s.queueIndex;
		if (index < s.queueIndex) {
			newIdx--;
		}
		return {
			...s,
			queue: newQueue,
			queueIndex: newIdx
		};
	});
}

export function clearQueue() {
	playerStore.update((s) => {
		const current = s.currentTrack;
		return {
			...s,
			queue: current ? [current] : [],
			originalQueue: current ? [current] : [],
			queueIndex: 0
		};
	});
}

export async function toggleFavoriteCurrent() {
	const current = get(playerStore).currentTrack;
	if (!current) return;
	const isFav = await dbToggleFavorite(current);
	playerStore.update((s) => ({ ...s, isCurrentFavorite: isFav }));
	showToast(isFav ? 'Adicionada às Músicas Curtidas' : 'Removida das Músicas Curtidas', 'success');
}

export function toggleVideoVisibility() {
	playerStore.update((s) => ({ ...s, isVideoVisible: !s.isVideoVisible }));
}

export function toggleQueueDrawer() {
	playerStore.update((s) => ({ ...s, isQueueOpen: !s.isQueueOpen }));
}

export function setMobileExpanded(expanded: boolean) {
	playerStore.update((s) => ({ ...s, isMobileExpanded: expanded }));
}

// Formata segundos em mm:ss ou hh:mm:ss
export function formatTime(seconds: number): string {
	if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
	const totalSecs = Math.floor(seconds);
	const hrs = Math.floor(totalSecs / 3600);
	const mins = Math.floor((totalSecs % 3600) / 60);
	const secs = totalSecs % 60;

	if (hrs > 0) {
		return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}
	return `${mins}:${secs.toString().padStart(2, '0')}`;
}
