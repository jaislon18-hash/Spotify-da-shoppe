<script lang="ts">
	import { onMount } from 'svelte';
	import { initializeYouTubeApi, playerStore, toggleVideoVisibility } from '$lib/stores/playerStore';
	import { Tv, X } from '@lucide/svelte';

	onMount(() => {
		initializeYouTubeApi('soniq-yt-iframe');
	});
</script>

<!-- Contêiner do Player Oficial do YouTube -->
<!-- Mantido permanentemente montado no DOM para não reiniciar a reprodução nem ser suspenso pelo celular -->
<div
	class="transition-all duration-300 {$playerStore.isVideoVisible
		? 'fixed bottom-24 right-4 md:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm md:max-w-md aspect-video rounded-2xl overflow-hidden shadow-2xl border backdrop-blur-xl opacity-100 scale-100 pointer-events-auto'
		: 'fixed bottom-0 right-0 w-[160px] h-[90px] pointer-events-none overflow-hidden'}"
	style="background-color: var(--color-surface-card); border-color: var(--color-border-subtle); {$playerStore.isVideoVisible ? '' : 'transform: scale(0.01); transform-origin: bottom right; z-index: 1;'}"
>
	{#if $playerStore.isVideoVisible}
		<!-- Barra superior da janela de vídeo PiP -->
		<div class="flex items-center justify-between px-3 py-1.5 bg-black/60 backdrop-blur-md text-white text-xs">
			<span class="flex items-center gap-1.5 font-medium truncate">
				<Tv class="w-3.5 h-3.5 text-indigo-400" />
				<span class="truncate">{$playerStore.currentTrack?.title || 'Vídeo Oficial'}</span>
			</span>
			<button
				onclick={toggleVideoVisibility}
				class="p-1 hover:bg-white/20 rounded-full transition-colors"
				title="Ocultar vídeo"
			>
				<X class="w-3.5 h-3.5" />
			</button>
		</div>
	{/if}

	<!-- Frame oficial do YouTube com dimensões reais para não ser suspenso pelo navegador mobile -->
	<div class="w-full {$playerStore.isVideoVisible ? 'h-[calc(100%-28px)]' : 'h-full'} bg-black">
		<div id="soniq-yt-iframe" class="w-full h-full"></div>
	</div>
</div>
