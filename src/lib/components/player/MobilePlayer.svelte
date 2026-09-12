<script lang="ts">
	import {
		playerStore,
		togglePlay,
		playNext,
		playPrevious,
		seekTo,
		toggleShuffle,
		toggleRepeat,
		toggleFavoriteCurrent,
		setMobileExpanded,
		toggleVideoVisibility,
		toggleQueueDrawer,
		toggleOledSleepMode,
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
		Heart,
		ChevronDown,
		PlusCircle,
		Tv,
		ListMusic,
		Loader2,
		Moon
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
</script>

{#if $playerStore.currentTrack}
	<!-- 1. Mini-player docked acima da barra de navegação inferior (Mobile) -->
	<div
		class="md:hidden fixed left-2 right-2 z-30 transition-all duration-300"
		style="bottom: calc(56px + max(0.625rem, env(safe-area-inset-bottom)));"
	>
		<div
			class="flex items-center justify-between p-2 rounded-2xl shadow-xl border backdrop-blur-2xl transition-all"
			style="background-color: var(--color-surface-card); border-color: var(--color-border-subtle);"
		>
			<!-- Toque para abrir tela cheia -->
			<div
				class="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
				onclick={() => setMobileExpanded(true)}
				role="button"
				tabindex="0"
				onkeydown={(e) => e.key === 'Enter' && setMobileExpanded(true)}
			>
				<img
					src={$playerStore.currentTrack.thumbnail}
					alt={$playerStore.currentTrack.title}
					class="w-11 h-11 rounded-xl object-cover shadow-md shrink-0"
				/>
				<div class="truncate flex-1">
					<h4 class="font-semibold text-xs truncate" style="color: var(--color-text-main);">
						{$playerStore.currentTrack.title}
					</h4>
					<p class="text-[11px] text-slate-400 truncate">
						{$playerStore.currentTrack.artist}
					</p>
				</div>
			</div>

			<!-- Ações rápidas do mini-player -->
			<div class="flex items-center gap-1 shrink-0">
				<!-- Botão Vídeo Flutuante -->
				<button
					onclick={toggleVideoVisibility}
					class="p-2 text-slate-400 hover:text-indigo-400 transition-colors"
					title="Assistir clipe"
				>
					<Tv class="w-4 h-4 {$playerStore.isVideoVisible ? 'text-indigo-400' : ''}" />
				</button>

				<!-- Botão Favoritar -->
				<button
					onclick={toggleFavoriteCurrent}
					class="p-2 text-slate-400 hover:text-rose-500 transition-colors"
					title="Favoritar"
				>
					<Heart
						class="w-4 h-4 {$playerStore.isCurrentFavorite ? 'fill-rose-500 text-rose-500' : ''}"
					/>
				</button>

				<!-- Botão Play/Pause -->
				<button
					onclick={togglePlay}
					class="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-md active:scale-90 transition-transform"
					title={$playerStore.isPlaying ? 'Pausar' : 'Tocar'}
				>
					{#if $playerStore.isBuffering}
						<Loader2 class="w-4 h-4 animate-spin" />
					{:else if $playerStore.isPlaying}
						<Pause class="w-4 h-4 fill-current" />
					{:else}
						<Play class="w-4 h-4 fill-current ml-0.5" />
					{/if}
				</button>
			</div>
		</div>

		<!-- Mini Barra de Progresso fina logo abaixo do mini-player -->
		<div class="w-full bg-black/20 h-0.5 rounded-full overflow-hidden mt-0.5">
			<div
				class="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
				style="width: {$playerStore.progressPercent}%;"
			></div>
		</div>
	</div>

	<!-- 2. Player em Tela Completa (Full Screen Mobile Player Drawer) -->
	{#if $playerStore.isMobileExpanded}
		<div
			class="md:hidden fixed inset-0 z-50 flex flex-col p-6 animate-in slide-in-from-bottom duration-300 backdrop-blur-3xl overflow-y-auto select-none"
			style="background: linear-gradient(180deg, rgba(10, 12, 22, 0.96) 0%, rgba(18, 22, 38, 0.98) 100%); color: var(--color-text-main);"
		>
			<!-- Cabeçalho da Tela Cheia: Botão Fechar & Título -->
			<div class="flex items-center justify-between mb-6 pt-2">
				<button
					onclick={() => setMobileExpanded(false)}
					class="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all"
					title="Minimizar"
				>
					<ChevronDown class="w-6 h-6" />
				</button>

				<div class="text-center">
					<span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold block"></span>
					<span class="text-xs font-semibold text-indigo-400 truncate max-w-[200px] block">Soniq Music</span>
				</div>

				<button
					onclick={() => $playerStore.currentTrack && openAddToPlaylist($playerStore.currentTrack)}
					class="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all"
					title="Adicionar à playlist"
				>
					<PlusCircle class="w-5 h-5" />
				</button>
			</div>

			<!-- Capa Gigante com Efeito Glow -->
			<div class="my-auto flex flex-col items-center">
				<div class="relative w-full max-w-[320px] aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/20 border border-white/10 group">
					<img
						src={$playerStore.currentTrack.thumbnail}
						alt={$playerStore.currentTrack.title}
						class="w-full h-full object-cover"
					/>
					<button
						onclick={toggleOledSleepMode}
						class="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs text-white border border-white/20 active:scale-95 transition-all shadow-md"
						title="Modo Economia OLED (Mantém música tocando com tela apagada)"
					>
						<Moon class="w-3.5 h-3.5 text-indigo-400" />
						<span>Economia</span>
					</button>
					<button
						onclick={toggleVideoVisibility}
						class="absolute bottom-3 right-3 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium border active:scale-95 transition-all shadow-md {$playerStore.isVideoVisible ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-black/60 backdrop-blur-md border-white/20 text-white'}"
						title="Exibir ou ocultar vídeo do YouTube"
					>
						<Tv class="w-3.5 h-3.5 {$playerStore.isVideoVisible ? 'text-white' : 'text-indigo-400'}" />
						<span>{$playerStore.isVideoVisible ? 'Ocultar' : 'Vídeo'}</span>
					</button>
				</div>

				<!-- Metadados da Música e Botão de Favoritar -->
				<div class="w-full max-w-[320px] flex items-center justify-between mt-6">
					<div class="truncate pr-4">
						<h3 class="font-display font-bold text-lg leading-tight truncate text-white">
							{$playerStore.currentTrack.title}
						</h3>
						<p class="text-sm text-slate-400 truncate mt-1">
							{$playerStore.currentTrack.artist}
						</p>
					</div>

					<button
						onclick={toggleFavoriteCurrent}
						class="p-3 rounded-full bg-white/5 active:scale-90 transition-transform shrink-0"
						title="Favoritar"
					>
						<Heart
							class="w-6 h-6 {$playerStore.isCurrentFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}"
						/>
					</button>
				</div>
			</div>

			<!-- Controles Inferiores da Tela Cheia -->
			<div class="w-full max-w-[320px] mx-auto pb-4">
				<!-- Scrubber / Barra de Progresso -->
				<div class="mb-4">
					<input
						type="range"
						min="0"
						max={$playerStore.duration || 100}
						step="0.5"
						value={isSeeking ? seekValue : $playerStore.currentTime}
						oninput={handleSeekInput}
						onchange={handleSeekChange}
						class="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-700/60 accent-indigo-500"
					/>
					<div class="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-1">
						<span>{formatTime(isSeeking ? seekValue : $playerStore.currentTime)}</span>
						<span>{formatTime($playerStore.duration)}</span>
					</div>
				</div>

				<!-- Botões Grandes de Reprodução -->
				<div class="flex items-center justify-between gap-2 mb-4">
					<!-- Shuffle -->
					<button
						onclick={toggleShuffle}
						class="p-3 rounded-full transition-colors relative"
						style="color: {$playerStore.isShuffle ? 'var(--color-accent)' : 'var(--color-text-dim)'};"
					>
						<Shuffle class="w-5 h-5" />
					</button>

					<!-- Anterior -->
					<button
						onclick={playPrevious}
						class="p-3 text-white active:scale-90 transition-transform"
					>
						<SkipBack class="w-7 h-7 fill-current" />
					</button>

					<!-- Play / Pause Principal Gigante -->
					<button
						onclick={togglePlay}
						class="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 text-white shadow-xl shadow-indigo-500/30 active:scale-95 transition-transform"
					>
						{#if $playerStore.isBuffering}
							<Loader2 class="w-7 h-7 animate-spin" />
						{:else if $playerStore.isPlaying}
							<Pause class="w-7 h-7 fill-current" />
						{:else}
							<Play class="w-7 h-7 fill-current ml-1" />
						{/if}
					</button>

					<!-- Próxima -->
					<button
						onclick={playNext}
						class="p-3 text-white active:scale-90 transition-transform"
					>
						<SkipForward class="w-7 h-7 fill-current" />
					</button>

					<!-- Repetir -->
					<button
						onclick={toggleRepeat}
						class="p-3 rounded-full transition-colors relative"
						style="color: {$playerStore.repeatMode !== 'off' ? 'var(--color-accent)' : 'var(--color-text-dim)'};"
					>
						{#if $playerStore.repeatMode === 'one'}
							<Repeat1 class="w-5 h-5 text-indigo-400" />
						{:else}
							<Repeat class="w-5 h-5" />
						{/if}
					</button>
				</div>

				<!-- Barra Inferior de Utilidades: Fila e Equalizer -->
				<div class="flex items-center justify-between px-2 pt-2 border-t border-white/10">
					<!-- Equalizer se tocando -->
					<div class="flex items-center gap-1.5">
						{#if $playerStore.isPlaying}
							<div class="flex items-end gap-0.5 h-4">
								<span class="w-1 bg-cyan-400 rounded-full eq-bar-1"></span>
								<span class="w-1 bg-indigo-400 rounded-full eq-bar-2"></span>
								<span class="w-1 bg-pink-400 rounded-full eq-bar-3"></span>
								<span class="w-1 bg-emerald-400 rounded-full eq-bar-4"></span>
							</div>
							<span class="text-xs text-slate-400 ml-1">Reproduzindo</span>
						{:else}
							<span class="text-xs text-slate-500">Pausado</span>
						{/if}
					</div>

					<button
						onclick={() => {
							setMobileExpanded(false);
							toggleQueueDrawer();
						}}
						class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-xs font-medium text-white hover:bg-white/20 active:scale-95 transition-all"
					>
						<ListMusic class="w-4 h-4 text-indigo-400" />
						<span>Ver Fila ({$playerStore.queue.length})</span>
					</button>
				</div>
			</div>
		</div>
	{/if}
{/if}
