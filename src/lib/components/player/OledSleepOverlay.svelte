<script lang="ts">
	import {
		playerStore,
		togglePlay,
		playNext,
		playPrevious,
		setOledSleepMode
	} from '$lib/stores/playerStore';
	import { Play, Pause, SkipBack, SkipForward, Moon, X } from '@lucide/svelte';
	import { onMount, onDestroy } from 'svelte';

	let currentTimeStr = $state('');
	let timerInterval: any = null;

	function updateTime() {
		const now = new Date();
		const hours = now.getHours().toString().padStart(2, '0');
		const mins = now.getMinutes().toString().padStart(2, '0');
		currentTimeStr = `${hours}:${mins}`;
	}

	onMount(() => {
		updateTime();
		timerInterval = setInterval(updateTime, 10000);
	});

	onDestroy(() => {
		if (timerInterval) clearInterval(timerInterval);
	});

	let lastTap = 0;
	function handleScreenTap() {
		const now = Date.now();
		if (now - lastTap < 350) {
			// Toque duplo sai do modo
			setOledSleepMode(false);
		}
		lastTap = now;
	}
</script>

{#if $playerStore.isOledSleepMode}
	<div
		class="fixed inset-0 z-[100] flex flex-col justify-between items-center p-8 select-none transition-opacity duration-500"
		style="background-color: #000000; color: #64748b;"
		onclick={handleScreenTap}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && setOledSleepMode(false)}
	>
		<!-- Topo: Modo Economia OLED e botão de fechar -->
		<div class="w-full flex items-center justify-between text-xs text-slate-600">
			<span class="flex items-center gap-1.5 tracking-wider uppercase text-[10px] font-semibold text-slate-600">
				<Moon class="w-3.5 h-3.5 text-indigo-500/60" />
				Modo Economia OLED (Tela Ativa)
			</span>
			<button
				onclick={(e) => {
					e.stopPropagation();
					setOledSleepMode(false);
				}}
				class="p-2 rounded-full text-slate-500 hover:text-white transition-colors"
				title="Sair do Modo Economia"
			>
				<X class="w-5 h-5" />
			</button>
		</div>

		<!-- Centro: Relógio Minimalista e Info da Música -->
		<div class="flex flex-col items-center text-center space-y-4 max-w-xs">
			<div class="font-display font-light text-6xl tracking-tight text-slate-600 select-none">
				{currentTimeStr}
			</div>

			{#if $playerStore.currentTrack}
				<div class="space-y-1">
					<h3 class="font-medium text-sm text-slate-400 truncate max-w-[260px]">
						{$playerStore.currentTrack.title}
					</h3>
					<p class="text-xs text-slate-600 truncate max-w-[260px]">
						{$playerStore.currentTrack.artist}
					</p>
				</div>
			{/if}

			<!-- Controles Minimalistas com Brilho Baixo -->
			<div class="flex items-center justify-center gap-6 pt-4" onclick={(e) => e.stopPropagation()} role="presentation">
				<button
					onclick={playPrevious}
					class="p-3 text-slate-600 hover:text-slate-300 active:scale-95 transition-all"
					title="Anterior"
				>
					<SkipBack class="w-5 h-5 fill-current" />
				</button>

				<button
					onclick={togglePlay}
					class="w-12 h-12 rounded-full border border-slate-700/60 text-slate-400 flex items-center justify-center hover:border-slate-500 hover:text-white active:scale-95 transition-all"
					title={$playerStore.isPlaying ? 'Pausar' : 'Tocar'}
				>
					{#if $playerStore.isPlaying}
						<Pause class="w-5 h-5 fill-current" />
					{:else}
						<Play class="w-5 h-5 fill-current ml-0.5" />
					{/if}
				</button>

				<button
					onclick={playNext}
					class="p-3 text-slate-600 hover:text-slate-300 active:scale-95 transition-all"
					title="Próxima"
				>
					<SkipForward class="w-5 h-5 fill-current" />
				</button>
			</div>
		</div>

		<!-- Rodapé: Dica -->
		<div class="text-[11px] text-slate-700 text-center pb-2">
			Toque 2x na tela para voltar ao player normal
		</div>
	</div>
{/if}
