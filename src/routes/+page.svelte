<script lang="ts">
	import { onMount } from 'svelte';
	import { getHistory, getPlaylists, getFavorites, INITIAL_CURATED_TRACKS } from '$lib/db';
	import type { Track, Playlist, HistoryEntry } from '$lib/types/music';
	import TrackCard from '$lib/components/track/TrackCard.svelte';
	import { playerStore, playTrack } from '$lib/stores/playerStore';
	import { openPlaylistModal } from '$lib/stores/appStore';
	import { DEMO_MUSIC_CATALOG } from '$lib/services/youtubeApi';
	import { Play, Heart, Plus, Sparkles, Clock, Music2, Compass, Radio } from '@lucide/svelte';

	let greeting = $state('Olá!');
	let historyTracks = $state<Track[]>([]);
	let userPlaylists = $state<Playlist[]>([]);
	let favoriteTracks = $state<Track[]>([]);

	const MOODS = [
		{ label: 'Relax & Lofi', query: 'lofi hip hop relax' },
		{ label: 'Pop Internacional', query: 'pop hits' },
		{ label: 'Rock Clássico', query: 'classic rock' },
		{ label: 'Synthwave & Electro', query: 'synthwave electro' },
		{ label: 'Foco & Estudo', query: 'study instrumental music' }
	];

	function getGreeting(): string {
		const hour = new Date().getHours();
		if (hour >= 5 && hour < 12) return 'Bom dia';
		if (hour >= 12 && hour < 18) return 'Boa tarde';
		return 'Boa noite';
	}

	async function loadHomeData() {
		greeting = getGreeting();
		const hist = await getHistory(10);
		historyTracks = hist.map((h) => h.track);
		userPlaylists = await getPlaylists();
		favoriteTracks = await getFavorites();
	}

	onMount(() => {
		loadHomeData();

		const handleUpdate = () => loadHomeData();
		window.addEventListener('soniq-playlists-updated', handleUpdate);
		window.addEventListener('soniq-favorites-updated', handleUpdate);
		return () => {
			window.removeEventListener('soniq-playlists-updated', handleUpdate);
			window.removeEventListener('soniq-favorites-updated', handleUpdate);
		};
	});

	function playPlaylist(playlist: Playlist) {
		if (playlist.tracks.length > 0) {
			playTrack(playlist.tracks[0], playlist.tracks);
		}
	}

	function playFavorites() {
		if (favoriteTracks.length > 0) {
			playTrack(favoriteTracks[0], favoriteTracks);
		}
	}
</script>

<div class="space-y-10 max-w-7xl mx-auto">
	<!-- Saudação & Chips de Vibe / Humor -->
	<div>
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
			<div>
				<h1 class="font-display font-extrabold text-2xl sm:text-4xl tracking-tight leading-none" style="color: var(--color-text-main);">
					{greeting}
				</h1>
				<p class="text-xs sm:text-sm text-slate-400 mt-1.5">
					Seu catálogo pessoal de streaming.
				</p>
			</div>

			<!-- Chips Rápidos -->
			<div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
				{#each MOODS as mood}
					<a
						href="/search?q={encodeURIComponent(mood.query)}"
						class="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border hover:scale-105 active:scale-95 shadow-sm"
						style="background-color: var(--color-surface-card); border-color: var(--color-border-subtle); color: var(--color-text-main);"
					>
						{mood.label}
					</a>
				{/each}
			</div>
		</div>

		<!-- Grade de Acesso Rápido Superior (Cards 2 Colunas) -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
			<!-- Card Rápido: Músicas Curtidas -->
			<a
				href="/library?tab=favorites"
				class="group flex items-center justify-between p-2.5 rounded-2xl border transition-all duration-200 hover:scale-[1.01] shadow-sm cursor-pointer"
				style="background-color: var(--color-surface-card); border-color: var(--color-border-subtle);"
			>
				<div class="flex items-center gap-3.5 min-w-0">
					<div class="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shrink-0">
						<Heart class="w-6 h-6 fill-white" />
					</div>
					<div class="truncate">
						<span class="font-bold text-sm block truncate" style="color: var(--color-text-main);">Músicas Curtidas</span>
						<span class="text-xs text-slate-400 block">{favoriteTracks.length} {favoriteTracks.length === 1 ? 'faixa' : 'faixas'}</span>
					</div>
				</div>

				<button
					onclick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						playFavorites();
					}}
					class="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-600 text-white shadow-md opacity-0 group-hover:opacity-100 transition-all mr-2 hover:scale-110 active:scale-90"
					title="Reproduzir Curtidas"
				>
					<Play class="w-4 h-4 fill-current ml-0.5" />
				</button>
			</a>

			<!-- Cards Rápidos: Primeiras Playlists -->
			{#each userPlaylists.slice(0, 5) as pl}
				<a
					href="/playlist/{pl.id}"
					class="group flex items-center justify-between p-2.5 rounded-2xl border transition-all duration-200 hover:scale-[1.01] shadow-sm cursor-pointer"
					style="background-color: var(--color-surface-card); border-color: var(--color-border-subtle);"
				>
					<div class="flex items-center gap-3.5 min-w-0">
						<div class="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br {pl.color} text-white shadow-md shrink-0">
							<Music2 class="w-6 h-6" />
						</div>
						<div class="truncate">
							<span class="font-bold text-sm block truncate" style="color: var(--color-text-main);">{pl.name}</span>
							<span class="text-xs text-slate-400 block">{pl.tracks.length} músicas</span>
						</div>
					</div>

					<button
						onclick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							playPlaylist(pl);
						}}
						class="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-600 text-white shadow-md opacity-0 group-hover:opacity-100 transition-all mr-2 hover:scale-110 active:scale-90"
						title="Reproduzir Playlist"
					>
						<Play class="w-4 h-4 fill-current ml-0.5" />
					</button>
				</a>
			{/each}
		</div>
	</div>

	<!-- Seção: Ouvidas Recentemente (se houver histórico) -->
	{#if historyTracks.length > 0}
		<div>
			<div class="flex items-center justify-between mb-4">
				<div class="flex items-center gap-2">
					<Clock class="w-5 h-5 text-indigo-400" />
					<h2 class="font-display font-bold text-lg sm:text-xl" style="color: var(--color-text-main);">
						Ouvidas Recentemente
					</h2>
				</div>
				<a href="/library?tab=history" class="text-xs font-semibold text-indigo-400 hover:underline">
					Ver tudo
				</a>
			</div>

			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
				{#each historyTracks.slice(0, 6) as track (track.id)}
					<TrackCard {track} playlistContext={historyTracks} />
				{/each}
			</div>
		</div>
	{/if}

	<!-- Seção: Recomendações & Descobertas -->
	<div>
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<Sparkles class="w-5 h-5 text-cyan-400" />
				<div>
					<h2 class="font-display font-bold text-lg sm:text-xl" style="color: var(--color-text-main);">
						Em Alta & Sugestões
					</h2>
					<p class="text-xs text-slate-400">Faixas populares prontas para tocar imediatamente</p>
				</div>
			</div>
		</div>

		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
			{#each DEMO_MUSIC_CATALOG.slice(0, 12) as track (track.id)}
				<TrackCard {track} playlistContext={DEMO_MUSIC_CATALOG} />
			{/each}
		</div>
	</div>

	<!-- Seção: Suas Playlists -->
	<div>
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<Music2 class="w-5 h-5 text-indigo-400" />
				<h2 class="font-display font-bold text-lg sm:text-xl" style="color: var(--color-text-main);">
					Suas Playlists
				</h2>
			</div>

			<button
				onclick={() => openPlaylistModal()}
				class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-600/15 text-indigo-400 hover:bg-indigo-600/25 transition-colors"
			>
				<Plus class="w-3.5 h-3.5" />
				<span>Nova Playlist</span>
			</button>
		</div>

		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
			{#each userPlaylists as pl (pl.id)}
				<a
					href="/playlist/{pl.id}"
					class="group p-3.5 rounded-2xl border transition-all duration-200 glow-card flex flex-col justify-between"
					style="background-color: var(--color-surface-card); border-color: var(--color-border-subtle);"
				>
					<div class="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-gradient-to-br {pl.color} flex items-center justify-center text-white shadow-md">
						<Music2 class="w-10 h-10 opacity-90 group-hover:scale-110 transition-transform" />

						<button
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								playPlaylist(pl);
							}}
							class="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full flex items-center justify-center bg-white text-indigo-600 shadow-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all hover:scale-105 active:scale-95"
							title="Tocar Playlist"
						>
							<Play class="w-4 h-4 fill-current ml-0.5" />
						</button>
					</div>

					<div class="truncate">
						<h4 class="font-semibold text-sm truncate" style="color: var(--color-text-main);">{pl.name}</h4>
						<p class="text-xs text-slate-400 truncate mt-0.5">{pl.tracks.length} músicas</p>
					</div>
				</a>
			{/each}
		</div>
	</div>
</div>
