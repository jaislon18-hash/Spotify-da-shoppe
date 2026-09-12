<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getPlaylist, deletePlaylist } from '$lib/db';
	import type { Playlist, Track } from '$lib/types/music';
	import TrackRow from '$lib/components/track/TrackRow.svelte';
	import { playerStore, playTrack } from '$lib/stores/playerStore';
	import { openPlaylistModal } from '$lib/stores/appStore';
	import { showToast } from '$lib/stores/toastStore';
	import {
		Play,
		Shuffle,
		Edit3,
		Trash2,
		Music2,
		Search,
		Clock,
		Sparkles,
		Plus
	} from '@lucide/svelte';

	let playlist = $state<Playlist | null>(null);
	let filterQuery = $state('');
	let isLoading = $state(true);

	async function loadPlaylistData() {
		isLoading = true;
		const id = $page?.params?.id;
		if (id) {
			const found = await getPlaylist(id);
			playlist = found || null;
		}
		isLoading = false;
	}

	onMount(() => {
		loadPlaylistData();

		const handleUpdate = () => loadPlaylistData();
		window.addEventListener('soniq-playlists-updated', handleUpdate);
		return () => window.removeEventListener('soniq-playlists-updated', handleUpdate);
	});

	let filteredTracks = $derived(() => {
		if (!playlist) return [];
		if (!filterQuery.trim()) return playlist.tracks;
		const q = filterQuery.toLowerCase();
		return playlist.tracks.filter(
			(t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
		);
	});

	let totalDurationFormatted = $derived(() => {
		if (!playlist || playlist.tracks.length === 0) return '0 min';
		const totalSecs = playlist.tracks.reduce((acc, t) => acc + (t.durationSec || 0), 0);
		const mins = Math.floor(totalSecs / 60);
		const hrs = Math.floor(mins / 60);
		if (hrs > 0) {
			return `${hrs} h ${mins % 60} min`;
		}
		return `${mins} min`;
	});

	function handlePlayAll() {
		if (playlist && playlist.tracks.length > 0) {
			playTrack(playlist.tracks[0], playlist.tracks);
		}
	}

	function handleShuffleAll() {
		if (playlist && playlist.tracks.length > 0) {
			const shuffled = [...playlist.tracks].sort(() => Math.random() - 0.5);
			playTrack(shuffled[0], shuffled);
		}
	}

	async function handleDelete() {
		if (!playlist) return;
		if (confirm(`Excluir permanentemente a playlist "${playlist.name}"?`)) {
			await deletePlaylist(playlist.id);
			showToast('Playlist excluída', 'info');
			window.dispatchEvent(new CustomEvent('soniq-playlists-updated'));
			goto('/library?tab=playlists');
		}
	}

	function handleEdit() {
		if (playlist) {
			openPlaylistModal(playlist);
		}
	}
</script>

{#if isLoading}
	<div class="py-24 text-center text-slate-400">
		<div class="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-2"></div>
		<p class="text-xs">Carregando playlist...</p>
	</div>
{:else if !playlist}
	<div class="py-24 text-center text-slate-400">
		<Music2 class="w-12 h-12 mx-auto mb-3 opacity-30 text-rose-500" />
		<h2 class="font-bold text-lg text-white">Playlist não encontrada</h2>
		<p class="text-xs sm:text-sm mt-1 mb-4">Esta playlist pode ter sido excluída.</p>
		<a href="/library" class="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">
			Voltar para Biblioteca
		</a>
	</div>
{:else}
	<div class="space-y-8 max-w-7xl mx-auto">
		<!-- Banner Hero da Playlist com Capa e Gradiente -->
		<div class="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-6 border-b" style="border-color: var(--color-border-subtle);">
			<!-- Capa com Gradiente -->
			<div class="w-44 h-44 sm:w-52 sm:h-52 rounded-3xl bg-gradient-to-br {playlist.color} flex items-center justify-center text-white shadow-2xl shrink-0">
				<Music2 class="w-20 h-20 opacity-90" />
			</div>

			<!-- Metadados do Banner -->
			<div class="flex-1 text-center sm:text-left min-w-0">
				<span class="text-xs uppercase font-bold tracking-widest text-indigo-400 block mb-1">
					Playlist Pessoal
				</span>

				<h1 class="font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl leading-tight truncate mb-2" style="color: var(--color-text-main);">
					{playlist.name}
				</h1>

				{#if playlist.description}
					<p class="text-xs sm:text-sm text-slate-400 line-clamp-2 mb-3">
						{playlist.description}
					</p>
				{/if}

				<div class="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-400">
					<span class="font-semibold text-white">Soniq</span>
					<span>•</span>
					<span>{playlist.tracks.length} músicas</span>
					<span>•</span>
					<span>{totalDurationFormatted()}</span>
				</div>
			</div>
		</div>

		<!-- Barra de Ações: Play, Shuffle, Editar, Excluir e Filtro interno -->
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
			<div class="flex items-center gap-3">
				<button
					onclick={handlePlayAll}
					disabled={playlist.tracks.length === 0}
					class="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-xl shadow-indigo-600/30 active:scale-95 transition-transform disabled:opacity-40"
				>
					<Play class="w-5 h-5 fill-current" />
					<span>Reproduzir</span>
				</button>

				<button
					onclick={handleShuffleAll}
					disabled={playlist.tracks.length === 0}
					class="p-3 rounded-full border hover:bg-white/5 active:scale-95 transition-transform disabled:opacity-40"
					style="border-color: var(--color-border-subtle); color: var(--color-text-main);"
					title="Reproduzir em ordem aleatória"
				>
					<Shuffle class="w-5 h-5" />
				</button>

				<button
					onclick={handleEdit}
					class="p-3 rounded-full border hover:bg-white/5 active:scale-95 transition-transform"
					style="border-color: var(--color-border-subtle); color: var(--color-text-main);"
					title="Editar título e cor"
				>
					<Edit3 class="w-5 h-5" />
				</button>

				<button
					onclick={handleDelete}
					class="p-3 rounded-full border hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 active:scale-95 transition-transform"
					style="border-color: var(--color-border-subtle);"
					title="Excluir playlist"
				>
					<Trash2 class="w-5 h-5" />
				</button>
			</div>

			<!-- Campo de busca dentro da playlist -->
			{#if playlist.tracks.length > 3}
				<div class="relative w-full sm:w-64">
					<Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
					<input
						type="text"
						bind:value={filterQuery}
						placeholder="Filtrar nesta playlist..."
						class="w-full pl-9 pr-3 py-2 text-xs rounded-xl border outline-none focus:ring-1 focus:ring-indigo-500"
						style="background-color: var(--color-surface-card); border-color: var(--color-border-subtle); color: var(--color-text-main);"
					/>
				</div>
			{/if}
		</div>

		<!-- Tabela / Lista de Músicas da Playlist -->
		{#if playlist.tracks.length === 0}
			<div class="py-16 text-center text-slate-400 border border-dashed rounded-3xl p-8" style="border-color: var(--color-border-subtle);">
				<Music2 class="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-400" />
				<h3 class="font-bold text-base text-white">Esta playlist está vazia</h3>
				<p class="text-xs sm:text-sm mt-1 mb-4 text-slate-400">
					Pesquise músicas no YouTube e adicione-as a esta lista com um clique.
				</p>
				<a
					href="/search"
					class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 text-white font-semibold text-xs shadow-md active:scale-95 transition-transform"
				>
					<Search class="w-4 h-4" />
					<span>Buscar Músicas no YouTube</span>
				</a>
			</div>
		{:else}
			<div class="space-y-1">
				{#each filteredTracks() as track, index (track.id + '-' + index)}
					<TrackRow
						{track}
						{index}
						playlistContext={playlist.tracks}
						currentPlaylistId={playlist.id}
						onRemoved={loadPlaylistData}
					/>
				{/each}
			</div>
		{/if}
	</div>
{/if}
