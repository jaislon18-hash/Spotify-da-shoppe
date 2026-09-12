<script lang="ts">
	import {
		playerStore,
		togglePlay,
		playNext,
		playPrevious,
		seekTo,
		setVolume,
		toggleMute,
		toggleShuffle,
		toggleRepeat,
		toggleFavoriteCurrent,
		toggleVideoVisibility,
		toggleQueueDrawer,
		formatTime
	} from '$lib/stores/playerStore';
	import { openAddToPlaylist } from '$lib/stores/appStore';
	import {
		Play,
		Pause,
		SkipBack,
		SkipForward,
		Shuffle,
		Repeat,
		Repeat1,
		Volume2,
		Volume1,
		VolumeX,
		Heart,
		PlusCircle,
		Tv,
		ListMusic,
		Loader2
	} from '@lucide/svelte';

	let isSeeking = $state(false);
	let seekValue = $state(0);

	function handleSeekInput(e: Event) {
		isSeeking = true;
		seekValue = parseFloat((e.target as HTMLInputElement).value);
	}

	function handleSeekChange(e: Event) {
		const val = parseFloat((e.target as HTMLInputElement).value);
		seekTo(val);
		isSeeking = false;
	}

	function handleVolumeChange(e: Event) {
		const val = parseFloat((e.target as HTMLInputElement).value);
		setVolume(val);
	}
</script>

{#if $playerStore.currentTrack}
	<footer
		class="hidden md:flex items-center justify-between px-6 py-3 fixed bottom-0 left-0 right-0 z-30 backdrop-blur-2xl border-t shadow-2xl transition-colors duration-200"
		style="background-color: var(--color-surface-player); border-color: var(--color-border-subtle); height: 90px;"
	>
		<!-- Esquerda: Metadados da Música & Ações Rápidas -->
		<div class="flex items-center gap-4 w-1/4 min-w-[220px]">
			<div class="relative group shrink-0">
				<img
					src={$playerStore.currentTrack.thumbnail}
					alt={$playerStore.currentTrack.title}
					class="w-14 h-14 rounded-xl object-cover shadow-lg group-hover:opacity-90 transition-opacity"
				/>
				<button
					onclick={toggleVideoVisibility}
					class="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
					title="Assistir clipe oficial"
				>
					<Tv class="w-5 h-5" />
				</button>
			</div>

			<div class="truncate">
				<h4 class="font-semibold text-sm truncate" style="color: var(--color-text-main);">
					{$playerStore.currentTrack.title}
				</h4>
				<p class="text-xs text-slate-400 truncate mt-0.5">
					{$playerStore.currentTrack.artist}
				</p>
			</div>

			<div class="flex items-center gap-1 shrink-0">
				<!-- Botão de Favoritar -->
				<button
					onclick={toggleFavoriteCurrent}
					class="p-2 rounded-full transition-transform hover:scale-115 active:scale-95 text-slate-400 hover:text-rose-500"
					title={$playerStore.isCurrentFavorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
				>
					<Heart
						class="w-4 h-4 {$playerStore.isCurrentFavorite ? 'fill-rose-500 text-rose-500' : ''}"
					/>
				</button>

				<!-- Botão Adicionar à Playlist -->
				<button
					onclick={() => $playerStore.currentTrack && openAddToPlaylist($playerStore.currentTrack)}
					class="p-2 rounded-full transition-transform hover:scale-115 active:scale-95 text-slate-400 hover:text-indigo-400"
					title="Adicionar a uma playlist"
				>
					<PlusCircle class="w-4 h-4" />
				</button>
			</div>
		</div>

		<!-- Centro: Controles de Reprodução & Barra de Progresso -->
		<div class="flex flex-col items-center gap-1.5 w-2/4 max-w-2xl px-4">
			<!-- Botões de Controle -->
			<div class="flex items-center gap-5">
				<!-- Botão Shuffle (Aleatório) -->
				<button
					onclick={toggleShuffle}
					class="p-2 rounded-full transition-colors relative hover:scale-105"
					style="color: {$playerStore.isShuffle ? 'var(--color-accent)' : 'var(--color-text-dim)'};"
					title="Reprodução aleatória"
				>
					<Shuffle class="w-4 h-4" />
					{#if $playerStore.isShuffle}
						<span class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500"></span>
					{/if}
				</button>

				<!-- Música Anterior -->
				<button
					onclick={playPrevious}
					class="p-2 rounded-full transition-transform hover:scale-110 active:scale-90"
					style="color: var(--color-text-main);"
					title="Música anterior"
				>
					<SkipBack class="w-5 h-5 fill-current" />
				</button>

				<!-- Play / Pause Principal -->
				<button
					onclick={togglePlay}
					class="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-108 active:scale-95 shadow-lg shadow-indigo-500/25 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white"
					title={$playerStore.isPlaying ? 'Pausar' : 'Reproduzir'}
				>
					{#if $playerStore.isBuffering}
						<Loader2 class="w-5 h-5 animate-spin text-white" />
					{:else if $playerStore.isPlaying}
						<Pause class="w-5 h-5 fill-current" />
					{:else}
						<Play class="w-5 h-5 fill-current ml-0.5" />
					{/if}
				</button>

				<!-- Próxima Música -->
				<button
					onclick={playNext}
					class="p-2 rounded-full transition-transform hover:scale-110 active:scale-90"
					style="color: var(--color-text-main);"
					title="Próxima música"
				>
					<SkipForward class="w-5 h-5 fill-current" />
				</button>

				<!-- Botão Repetir -->
				<button
					onclick={toggleRepeat}
					class="p-2 rounded-full transition-colors relative hover:scale-105"
					style="color: {$playerStore.repeatMode !== 'off' ? 'var(--color-accent)' : 'var(--color-text-dim)'};"
					title="Modo de repetição"
				>
					{#if $playerStore.repeatMode === 'one'}
						<Repeat1 class="w-4 h-4 text-indigo-400" />
						<span class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500"></span>
					{:else}
						<Repeat class="w-4 h-4" />
						{#if $playerStore.repeatMode === 'all'}
							<span class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500"></span>
						{/if}
					{/if}
				</button>
			</div>

			<!-- Barra de Progresso e Timers -->
			<div class="flex items-center gap-3 w-full">
				<span class="text-[11px] font-mono w-10 text-right text-slate-400">
					{formatTime(isSeeking ? seekValue : $playerStore.currentTime)}
				</span>

				<div class="relative flex-1 flex items-center group h-4">
					<input
						type="range"
						min="0"
						max={$playerStore.duration || 100}
						step="0.5"
						value={isSeeking ? seekValue : $playerStore.currentTime}
						oninput={handleSeekInput}
						onchange={handleSeekChange}
						class="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-700/50 accent-indigo-500 transition-all group-hover:h-2"
					/>
				</div>

				<span class="text-[11px] font-mono w-10 text-left text-slate-400">
					{formatTime($playerStore.duration)}
				</span>
			</div>
		</div>

		<!-- Direita: Visualizer, Vídeo, Fila e Volume -->
		<div class="flex items-center justify-end gap-3 w-1/4 min-w-[220px]">
			<!-- Barras de Equalizador se estiver tocando -->
			{#if $playerStore.isPlaying}
				<div class="flex items-end gap-0.5 h-4 px-2" title="Reproduzindo áudio">
					<span class="w-1 bg-cyan-400 rounded-full eq-bar-1"></span>
					<span class="w-1 bg-indigo-400 rounded-full eq-bar-2"></span>
					<span class="w-1 bg-purple-400 rounded-full eq-bar-3"></span>
					<span class="w-1 bg-pink-400 rounded-full eq-bar-4"></span>
				</div>
			{/if}

			<!-- Alternar Janela de Vídeo YouTube -->
			<button
				onclick={toggleVideoVisibility}
				class="p-2 rounded-xl transition-all hover:scale-105 {$playerStore.isVideoVisible ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:text-white'}"
				title="Ver clipe oficial do YouTube"
			>
				<Tv class="w-4 h-4" />
			</button>

			<!-- Botão de Fila -->
			<button
				onclick={toggleQueueDrawer}
				class="p-2 rounded-xl transition-all hover:scale-105 relative {$playerStore.isQueueOpen ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:text-white'}"
				title="Fila de reprodução"
			>
				<ListMusic class="w-4 h-4" />
				{#if $playerStore.queue.length > 0}
					<span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400"></span>
				{/if}
			</button>

			<!-- Controle de Volume -->
			<div class="flex items-center gap-2">
				<button
					onclick={toggleMute}
					class="p-2 text-slate-400 hover:text-white transition-colors"
					title={$playerStore.isMuted ? 'Desmutar' : 'Mutar'}
				>
					{#if $playerStore.isMuted || $playerStore.volume === 0}
						<VolumeX class="w-4 h-4 text-rose-400" />
					{:else if $playerStore.volume < 50}
						<Volume1 class="w-4 h-4" />
					{:else}
						<Volume2 class="w-4 h-4" />
					{/if}
				</button>

				<input
					type="range"
					min="0"
					max="100"
					value={$playerStore.isMuted ? 0 : $playerStore.volume}
					oninput={handleVolumeChange}
					class="w-20 h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-700/50 accent-indigo-500"
					title="Volume: {$playerStore.volume}%"
				/>
			</div>
		</div>
	</footer>
{/if}
