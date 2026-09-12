<script lang="ts">
	import type { Track } from '$lib/types/music';
	import { playerStore, playTrack, addToQueue, toggleVideoVisibility } from '$lib/stores/playerStore';
	import { toggleFavorite as dbToggleFavorite, isFavorite } from '$lib/db';
	import { openAddToPlaylist } from '$lib/stores/appStore';
	import { showToast } from '$lib/stores/toastStore';
	import { Play, Pause, MoreVertical, Heart, Plus, ListPlus, Tv } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let { track, playlistContext }: { track: Track; playlistContext?: Track[] } = $props();

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
	}

	function handleAddToQueue(e: MouseEvent) {
		e.stopPropagation();
		addToQueue(track);
		showToast('Adicionada à Fila de Reprodução', 'info');
		isMenuOpen = false;
	}

	function handleOpenAddToPlaylist(e: MouseEvent) {
		e.stopPropagation();
		openAddToPlaylist(track);
		isMenuOpen = false;
	}
</script>

<div
	class="group relative p-3.5 rounded-2xl transition-all duration-200 glow-card border hover:scale-[1.02] flex flex-col justify-between"
	style="background-color: var(--color-surface-card); border-color: {isCurrent ? 'var(--color-border-focus)' : 'var(--color-border-subtle)'};"
>
	<!-- Imagem de Capa e Botão de Reprodução no Hover -->
	<div class="relative w-full aspect-square rounded-xl overflow-hidden shadow-md mb-3 bg-slate-900/30">
		<img
			src={track.thumbnail}
			alt={track.title}
			loading="lazy"
			class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
		/>

		<!-- Overlay com Botão de Play circular -->
		<button
			onclick={handlePlay}
			class="absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 text-white shadow-xl shadow-indigo-600/40 transition-all duration-200 {isPlaying ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 scale-90 hover:scale-105 active:scale-95'}"
			title={isPlaying ? 'Pausar' : 'Reproduzir'}
		>
			{#if isPlaying}
				<Pause class="w-5 h-5 fill-current" />
			{:else}
				<Play class="w-5 h-5 fill-current ml-0.5" />
			{/if}
		</button>

		<!-- Indicador de Equalizer na imagem se estiver tocando -->
		{#if isPlaying}
			<div class="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full flex items-end gap-0.5 h-4">
				<span class="w-0.5 bg-cyan-400 rounded-full eq-bar-1"></span>
				<span class="w-0.5 bg-indigo-400 rounded-full eq-bar-2"></span>
				<span class="w-0.5 bg-pink-400 rounded-full eq-bar-3"></span>
			</div>
		{/if}
	</div>

	<!-- Informações da Faixa -->
	<div class="flex items-start justify-between gap-2">
		<div class="truncate flex-1">
			<h4
				class="font-semibold text-sm truncate leading-tight transition-colors {isCurrent ? 'text-indigo-400 font-bold' : ''}"
				style="color: {isCurrent ? 'var(--color-accent)' : 'var(--color-text-main)'};"
				title={track.title}
			>
				{track.title}
			</h4>
			<p class="text-xs text-slate-400 truncate mt-1" title={track.artist}>
				{track.artist}
			</p>
		</div>

		<!-- Menu 3 pontos -->
		<div class="relative">
			<button
				onclick={(e) => {
					e.stopPropagation();
					isMenuOpen = !isMenuOpen;
				}}
				class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 {isMenuOpen ? '!opacity-100' : ''}"
				title="Mais opções"
			>
				<MoreVertical class="w-4 h-4" />
			</button>

			<!-- Dropdown Menu -->
			{#if isMenuOpen}
				<div
					class="absolute right-0 bottom-8 z-30 w-44 rounded-xl shadow-2xl border backdrop-blur-xl p-1 animate-in fade-in zoom-in-95 duration-150"
					style="background-color: var(--color-surface-elevated); border-color: var(--color-border-subtle);"
				>
					<button
						onclick={handleToggleFavorite}
						class="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-white/10 text-left transition-colors"
						style="color: var(--color-text-main);"
					>
						<Heart class="w-3.5 h-3.5 {isFav ? 'fill-rose-500 text-rose-500' : ''}" />
						<span>{isFav ? 'Remover dos favoritos' : 'Favoritar'}</span>
					</button>

					<button
						onclick={handleAddToQueue}
						class="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-white/10 text-left transition-colors"
						style="color: var(--color-text-main);"
					>
						<ListPlus class="w-3.5 h-3.5 text-indigo-400" />
						<span>Tocar a seguir</span>
					</button>

					<button
						onclick={handleOpenAddToPlaylist}
						class="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-white/10 text-left transition-colors"
						style="color: var(--color-text-main);"
					>
						<Plus class="w-3.5 h-3.5 text-cyan-400" />
						<span>Adicionar à playlist</span>
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>
