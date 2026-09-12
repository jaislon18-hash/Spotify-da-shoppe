<script lang="ts">
	import type { Track } from '$lib/types/music';
	import { playerStore, playTrack, addToQueue } from '$lib/stores/playerStore';
	import { toggleFavorite as dbToggleFavorite, isFavorite, removeTrackFromPlaylist } from '$lib/db';
	import { openAddToPlaylist } from '$lib/stores/appStore';
	import { showToast } from '$lib/stores/toastStore';
	import { Play, Pause, Heart, MoreVertical, Plus, ListPlus, Trash2 } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let {
		track,
		index = 0,
		playlistContext,
		currentPlaylistId,
		onRemoved
	}: {
		track: Track;
		index?: number;
		playlistContext?: Track[];
		currentPlaylistId?: string;
		onRemoved?: () => void;
	} = $props();

	let isMenuOpen = $state(false);
	let isFav = $state(false);

	let isCurrent = $derived($playerStore.currentTrack?.id === track.id);
	let isPlaying = $derived(isCurrent && $playerStore.isPlaying);

	async function checkFav() {
		isFav = await isFavorite(track.id);
	}

	onMount(() => {
		checkFav();

		const handleFavUpdate = (e: any) => {
			if (e.detail?.track?.id === track.id) {
				isFav = e.detail.isFav;
			} else if (!e.detail) {
				checkFav();
			}
		};
		window.addEventListener('soniq-favorites-updated', handleFavUpdate);
		return () => window.removeEventListener('soniq-favorites-updated', handleFavUpdate);
	});

	function handlePlay() {
		playTrack(track, playlistContext);
	}

	async function handleToggleFavorite(e: MouseEvent) {
		e.stopPropagation();
		isFav = await dbToggleFavorite(track);
		showToast(isFav ? 'Adicionada aos Favoritos' : 'Removida dos Favoritos', 'success');
		isMenuOpen = false;
		if (onRemoved && !isFav) {
			onRemoved();
		}
	}

	function handleAddToQueue(e: MouseEvent) {
		e.stopPropagation();
		addToQueue(track);
		showToast('Adicionada à Fila', 'info');
		isMenuOpen = false;
	}

	function handleOpenAddToPlaylist(e: MouseEvent) {
		e.stopPropagation();
		openAddToPlaylist(track);
		isMenuOpen = false;
	}

	async function handleRemoveFromThisPlaylist(e: MouseEvent) {
		e.stopPropagation();
		if (currentPlaylistId) {
			await removeTrackFromPlaylist(currentPlaylistId, track.id);
			showToast('Música removida da playlist', 'info');
			if (onRemoved) onRemoved();
		}
		isMenuOpen = false;
	}
</script>

<div
	class="group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 hover:bg-white/5 cursor-pointer {isCurrent ? 'bg-indigo-600/10' : ''}"
	onclick={handlePlay}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Enter' && handlePlay()}
>
	<!-- Número da faixa ou Ícone de Play -->
	<div class="flex items-center gap-3 min-w-0 flex-1">
		<div class="w-6 text-center shrink-0">
			{#if isPlaying}
				<div class="flex items-end justify-center gap-0.5 h-3.5">
					<span class="w-0.5 bg-indigo-500 rounded-full eq-bar-1"></span>
					<span class="w-0.5 bg-indigo-500 rounded-full eq-bar-2"></span>
					<span class="w-0.5 bg-indigo-500 rounded-full eq-bar-3"></span>
				</div>
			{:else}
				<span class="text-xs font-mono text-slate-500 group-hover:hidden">{index + 1}</span>
				<Play class="w-3.5 h-3.5 text-white fill-current mx-auto hidden group-hover:block" />
			{/if}
		</div>

		<!-- Capa da Música -->
		<img
			src={track.thumbnail}
			alt={track.title}
			class="w-10 h-10 rounded-lg object-cover shadow shrink-0"
		/>

		<!-- Título & Artista -->
		<div class="truncate flex-1 min-w-0">
			<h4
				class="font-medium text-sm truncate leading-tight {isCurrent ? 'text-indigo-400 font-semibold' : ''}"
				style="color: {isCurrent ? 'var(--color-accent)' : 'var(--color-text-main)'};"
			>
				{track.title}
			</h4>
			<p class="text-xs text-slate-400 truncate mt-0.5">
				{track.artist}
			</p>
		</div>
	</div>

	<!-- Duração e Ações Rápidas -->
	<div class="flex items-center gap-2 shrink-0">
		<!-- Botão Favoritar -->
		<button
			onclick={handleToggleFavorite}
			class="p-2 rounded-full text-slate-400 hover:text-rose-500 active:scale-90 transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 {isFav ? '!opacity-100 text-rose-500' : ''}"
			title={isFav ? 'Remover dos favoritos' : 'Favoritar'}
		>
			<Heart class="w-4 h-4 {isFav ? 'fill-rose-500 text-rose-500' : ''}" />
		</button>

		<!-- Duração -->
		<span class="text-xs font-mono text-slate-400 w-12 text-right">
			{track.duration}
		</span>

		<!-- Menu 3 pontos -->
		<div class="relative">
			<button
				onclick={(e) => {
					e.stopPropagation();
					isMenuOpen = !isMenuOpen;
				}}
				class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 {isMenuOpen ? '!opacity-100' : ''}"
				title="Mais ações"
			>
				<MoreVertical class="w-4 h-4" />
			</button>

			{#if isMenuOpen}
				<div
					class="absolute right-0 bottom-8 z-30 w-44 rounded-xl shadow-2xl border backdrop-blur-xl p-1 animate-in fade-in zoom-in-95 duration-150"
					style="background-color: var(--color-surface-elevated); border-color: var(--color-border-subtle);"
				>
					<button
						onclick={handleAddToQueue}
						class="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-white/10 text-left transition-colors"
						style="color: var(--color-text-main);"
					>
						<ListPlus class="w-3.5 h-3.5 text-indigo-400" />
						<span>Adicionar à fila</span>
					</button>

					<button
						onclick={handleOpenAddToPlaylist}
						class="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-white/10 text-left transition-colors"
						style="color: var(--color-text-main);"
					>
						<Plus class="w-3.5 h-3.5 text-cyan-400" />
						<span>Salvar em playlist</span>
					</button>

					{#if currentPlaylistId}
						<button
							onclick={handleRemoveFromThisPlaylist}
							class="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-rose-500/10 text-rose-400 text-left transition-colors"
						>
							<Trash2 class="w-3.5 h-3.5" />
							<span>Remover desta playlist</span>
						</button>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
