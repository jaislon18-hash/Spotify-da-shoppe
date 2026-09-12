<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import {
		getFavorites,
		getPlaylists,
		getHistory,
		deletePlaylist,
		type SoniqDatabase
	} from '$lib/db';
	import type { Track, Playlist, HistoryEntry } from '$lib/types/music';
	import TrackRow from '$lib/components/track/TrackRow.svelte';
	import { playerStore, playTrack } from '$lib/stores/playerStore';
	import { openPlaylistModal } from '$lib/stores/appStore';
	import { showToast } from '$lib/stores/toastStore';
	import {
		Heart,
		Music2,
		Clock,
		Play,
		Shuffle,
		Plus,
		MoreVertical,
		Trash2,
		Edit3,
		ListMusic
	} from '@lucide/svelte';

	let activeTab = $state<'favorites' | 'playlists' | 'history'>('favorites');

	let favorites = $state<Track[]>([]);
	let playlists = $state<Playlist[]>([]);
	let history = $state<HistoryEntry[]>([]);

	async function loadData() {
		favorites = await getFavorites();
		playlists = await getPlaylists();
		history = await getHistory(50);
	}

	$effect(() => {
		const paramTab = $page?.url?.searchParams?.get('tab');
		if (paramTab === 'playlists' || paramTab === 'history' || paramTab === 'favorites') {
			activeTab = paramTab;
		}
	});

	onMount(() => {
		loadData();

		const handleUpdate = () => loadData();
		window.addEventListener('soniq-playlists-updated', handleUpdate);
		window.addEventListener('soniq-favorites-updated', handleUpdate);
		return () => {
			window.removeEventListener('soniq-playlists-updated', handleUpdate);
			window.removeEventListener('soniq-favorites-updated', handleUpdate);
		};
	});

	function playAllFavorites() {
		if (favorites.length > 0) {
			playTrack(favorites[0], favorites);
		}
	}

	function shuffleFavorites() {
		if (favorites.length > 0) {
			const shuffled = [...favorites].sort(() => Math.random() - 0.5);
			playTrack(shuffled[0], shuffled);
		}
	}

	async function handleDeletePlaylist(pl: Playlist, e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (confirm(`Tem certeza que deseja excluir a playlist "${pl.name}"?`)) {
			await deletePlaylist(pl.id);
			showToast('Playlist excluída', 'info');
			window.dispatchEvent(new CustomEvent('soniq-playlists-updated'));
			loadData();
		}
	}

	function handleEditPlaylist(pl: Playlist, e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		openPlaylistModal(pl);
	}
</script>

<div class="space-y-6 max-w-7xl mx-auto">
	<!-- Cabeçalho da Biblioteca -->
	<div>
		<h1 class="font-display font-extrabold text-2xl sm:text-3xl" style="color: var(--color-text-main);">
			Sua Biblioteca
		</h1>
		<p class="text-xs sm:text-sm text-slate-400 mt-1">
			Suas músicas curtidas, coleções personalizadas e histórico de reprodução.
		</p>
	</div>

	<!-- Abas de Navegação da Biblioteca -->
	<div class="flex items-center gap-2 border-b pb-2" style="border-color: var(--color-border-subtle);">
		<button
			onclick={() => activeTab = 'favorites'}
			class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all {activeTab === 'favorites' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/5 opacity-70 hover:opacity-100'}"
		>
			<Heart class="w-4 h-4 fill-current" />
			<span>Curtidas ({favorites.length})</span>
		</button>

		<button
			onclick={() => activeTab = 'playlists'}
			class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all {activeTab === 'playlists' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/5 opacity-70 hover:opacity-100'}"
		>
			<Music2 class="w-4 h-4" />
			<span>Playlists ({playlists.length})</span>
		</button>

		<button
			onclick={() => activeTab = 'history'}
			class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all {activeTab === 'history' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/5 opacity-70 hover:opacity-100'}"
		>
			<Clock class="w-4 h-4" />
			<span>Histórico ({history.length})</span>
		</button>
	</div>

	<!-- Conteúdo da Aba 1: Músicas Curtidas -->
	{#if activeTab === 'favorites'}
		<div class="space-y-4">
			{#if favorites.length > 0}
				<!-- Barra de Ações: Tocar Tudo / Aleatório -->
				<div class="flex items-center gap-3">
					<button
						onclick={playAllFavorites}
						class="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95 transition-transform"
					>
						<Play class="w-4 h-4 fill-current" />
						<span>Reproduzir Tudo</span>
					</button>

					<button
						onclick={shuffleFavorites}
						class="flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-xs sm:text-sm border hover:bg-white/5 active:scale-95 transition-transform"
						style="border-color: var(--color-border-subtle); color: var(--color-text-main);"
					>
						<Shuffle class="w-4 h-4" />
						<span>Aleatório</span>
					</button>
				</div>

				<!-- Lista de Faixas -->
				<div class="space-y-1">
					{#each favorites as track, index (track.id)}
						<TrackRow {track} {index} playlistContext={favorites} onRemoved={loadData} />
					{/each}
				</div>
			{:else}
				<div class="py-16 text-center text-slate-400">
					<Heart class="w-12 h-12 mx-auto mb-3 opacity-30 text-rose-500" />
					<h3 class="font-bold text-base text-white">Nenhuma música curtida ainda</h3>
					<p class="text-xs sm:text-sm mt-1 text-slate-400">
						Clique no ícone de coração em qualquer música para salvá-la aqui.
					</p>
					<a
						href="/search"
						class="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-full bg-indigo-600 text-white font-semibold text-xs shadow-md hover:scale-105 active:scale-95 transition-all"
					>
						<span>Explorar Músicas</span>
					</a>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Conteúdo da Aba 2: Playlists -->
	{#if activeTab === 'playlists'}
		<div>
			<div class="flex items-center justify-between mb-4">
				<span class="text-xs font-bold uppercase tracking-wider text-slate-400">Coleções Locais</span>
				<button
					onclick={() => openPlaylistModal()}
					class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-600 text-white shadow-md active:scale-95 transition-all"
				>
					<Plus class="w-4 h-4" />
					<span>Criar Playlist</span>
				</button>
			</div>

			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
				<!-- Card "+ Criar Playlist" -->
				<button
					onclick={() => openPlaylistModal()}
					class="group p-4 rounded-2xl border border-dashed flex flex-col items-center justify-center min-h-[190px] transition-all hover:bg-white/5 active:scale-98"
					style="border-color: var(--color-border-hover);"
				>
					<div class="w-12 h-12 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
						<Plus class="w-6 h-6" />
					</div>
					<span class="font-bold text-sm" style="color: var(--color-text-main);">Nova Playlist</span>
					<span class="text-xs text-slate-400 mt-0.5">Criar do zero</span>
				</button>

				<!-- Playlists Criadas -->
				{#each playlists as pl (pl.id)}
					<a
						href="/playlist/{pl.id}"
						class="group p-3.5 rounded-2xl border transition-all duration-200 glow-card flex flex-col justify-between relative"
						style="background-color: var(--color-surface-card); border-color: var(--color-border-subtle);"
					>
						<div class="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-gradient-to-br {pl.color} flex items-center justify-center text-white shadow-md">
							<Music2 class="w-10 h-10 opacity-90 group-hover:scale-110 transition-transform" />

							<!-- Botões rápidos no hover da capa -->
							<div class="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
								<button
									onclick={(e) => handleEditPlaylist(pl, e)}
									class="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white hover:text-indigo-400 hover:bg-black/80 transition-colors"
									title="Editar Playlist"
								>
									<Edit3 class="w-3.5 h-3.5" />
								</button>
								<button
									onclick={(e) => handleDeletePlaylist(pl, e)}
									class="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white hover:text-rose-400 hover:bg-black/80 transition-colors"
									title="Excluir Playlist"
								>
									<Trash2 class="w-3.5 h-3.5" />
								</button>
							</div>
						</div>

						<div class="truncate">
							<h4 class="font-semibold text-sm truncate" style="color: var(--color-text-main);">{pl.name}</h4>
							<p class="text-xs text-slate-400 truncate mt-0.5">{pl.tracks.length} músicas</p>
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Conteúdo da Aba 3: Histórico -->
	{#if activeTab === 'history'}
		<div class="space-y-4">
			{#if history.length > 0}
				<div class="space-y-1">
					{#each history as item, index (item.id || index)}
						<div class="flex items-center justify-between">
							<div class="flex-1 min-w-0">
								<TrackRow track={item.track} index={index} playlistContext={history.map(h => h.track)} />
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="py-16 text-center text-slate-400">
					<Clock class="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-400" />
					<h3 class="font-bold text-base text-white">Nenhuma música no histórico</h3>
					<p class="text-xs sm:text-sm mt-1 text-slate-400">
						As faixas que você reproduzir aparecerão aqui automaticamente.
					</p>
				</div>
			{/if}
		</div>
	{/if}
</div>
