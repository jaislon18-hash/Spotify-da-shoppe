<script lang="ts">
	import {
		playerStore,
		toggleQueueDrawer,
		playTrack,
		removeFromQueue,
		clearQueue
	} from '$lib/stores/playerStore';
	import { X, Trash2, Music, Play, ListMusic } from '@lucide/svelte';

	function handlePlayFromQueue(track: any) {
		playTrack(track);
	}
</script>

{#if $playerStore.isQueueOpen}
	<!-- Overlay escuro -->
	<div
		class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
		onclick={toggleQueueDrawer}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && toggleQueueDrawer()}
	></div>

	<!-- Gaveta Lateral da Fila -->
	<div
		class="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm sm:max-w-md shadow-2xl flex flex-col border-l backdrop-blur-2xl animate-in slide-in-from-right duration-300"
		style="background-color: var(--color-surface-player); border-color: var(--color-border-subtle);"
	>
		<!-- Cabeçalho da Fila -->
		<div class="flex items-center justify-between p-5 border-b" style="border-color: var(--color-border-subtle);">
			<div class="flex items-center gap-2.5">
				<ListMusic class="w-5 h-5 text-indigo-500" />
				<h3 class="font-display font-bold text-lg" style="color: var(--color-text-main);">Fila de Reprodução</h3>
			</div>

			<div class="flex items-center gap-2">
				{#if $playerStore.queue.length > 1}
					<button
						onclick={clearQueue}
						class="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
						title="Limpar fila"
					>
						<Trash2 class="w-4 h-4" />
					</button>
				{/if}
				<button
					onclick={toggleQueueDrawer}
					class="p-2 rounded-xl hover:bg-white/10 transition-colors"
					style="color: var(--color-text-main);"
					title="Fechar fila"
				>
					<X class="w-5 h-5" />
				</button>
			</div>
		</div>

		<div class="flex-1 overflow-y-auto p-4 space-y-6">
			<!-- Seção Tocando Agora -->
			{#if $playerStore.currentTrack}
				<div>
					<span class="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">Tocando Agora</span>
					<div
						class="flex items-center gap-3.5 p-3 rounded-2xl border"
						style="background-color: var(--color-surface-card); border-color: var(--color-border-focus);"
					>
						<img
							src={$playerStore.currentTrack.thumbnail}
							alt={$playerStore.currentTrack.title}
							class="w-14 h-14 rounded-xl object-cover shadow-md shrink-0"
						/>
						<div class="flex-1 min-w-0">
							<h4 class="font-semibold text-sm truncate" style="color: var(--color-accent);">
								{$playerStore.currentTrack.title}
							</h4>
							<p class="text-xs text-slate-400 truncate mt-0.5">{$playerStore.currentTrack.artist}</p>
						</div>
						<!-- Equalizer animado se estiver tocando -->
						{#if $playerStore.isPlaying}
							<div class="flex items-end gap-0.5 h-4 pr-2">
								<span class="w-1 bg-indigo-500 rounded-full eq-bar-1"></span>
								<span class="w-1 bg-indigo-500 rounded-full eq-bar-2"></span>
								<span class="w-1 bg-indigo-500 rounded-full eq-bar-3"></span>
								<span class="w-1 bg-indigo-500 rounded-full eq-bar-4"></span>
							</div>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Seção Próximas da Fila -->
			<div>
				<div class="flex items-center justify-between mb-3">
					<span class="text-xs font-bold uppercase tracking-wider text-slate-400">Próximas Músicas</span>
					<span class="text-xs text-slate-400">{$playerStore.queue.length} faixas</span>
				</div>

				{#if $playerStore.queue.length === 0}
					<div class="py-12 text-center text-slate-400">
						<Music class="w-8 h-8 mx-auto mb-2 opacity-40" />
						<p class="text-sm">A fila de reprodução está vazia.</p>
						<p class="text-xs text-slate-500 mt-1">Busque músicas ou abra uma playlist para começar.</p>
					</div>
				{:else}
					<div class="space-y-1.5">
						{#each $playerStore.queue as track, index (track.id + '-' + index)}
							<div
								class="flex items-center justify-between gap-3 p-2.5 rounded-xl transition-all duration-150 group hover:bg-white/5 {index === $playerStore.queueIndex ? 'bg-indigo-600/10 font-semibold text-indigo-400' : ''}"
							>
								<div
									class="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
									onclick={() => handlePlayFromQueue(track)}
									role="button"
									tabindex="0"
									onkeydown={(e) => e.key === 'Enter' && handlePlayFromQueue(track)}
								>
									<span class="text-xs text-slate-500 w-5 text-center font-mono">
										{index + 1}
									</span>
									<img
										src={track.thumbnail}
										alt={track.title}
										class="w-10 h-10 rounded-lg object-cover shadow shrink-0"
									/>
									<div class="flex-1 min-w-0">
										<p class="text-sm font-medium truncate" style="color: index === $playerStore.queueIndex ? 'var(--color-accent)' : 'var(--color-text-main)';">
											{track.title}
										</p>
										<p class="text-xs text-slate-400 truncate">{track.artist}</p>
									</div>
								</div>

								<div class="flex items-center gap-1">
									<span class="text-xs text-slate-500 font-mono mr-1">{track.duration}</span>
									<button
										onclick={() => removeFromQueue(index)}
										class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
										title="Remover da fila"
									>
										<X class="w-4 h-4" />
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
