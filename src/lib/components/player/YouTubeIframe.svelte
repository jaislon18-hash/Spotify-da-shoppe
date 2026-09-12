<script lang="ts">
	import { onMount } from 'svelte';
	import { initializeYouTubeApi, playerStore, toggleVideoVisibility } from '$lib/stores/playerStore';
	import { Tv, X, Maximize2 } from '@lucide/svelte';

	onMount(() => {
		initializeYouTubeApi('soniq-yt-iframe');
	});
</script>

<!-- Contêiner do Player Oficial do YouTube -->
{#if $playerStore.isVideoVisible}
	<!-- Janela flutuante PiP do Vídeo Oficial quando o usuário ativa o modo vídeo -->
	<div
		class="fixed bottom-24 right-6 z-50 w-80 md:w-96 aspect-video rounded-2xl overflow-hidden shadow-2xl border backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
		style="background-color: var(--color-surface-card); border-color: var(--color-border-subtle);"
	>
		<!-- Barra de controle da janela de vídeo -->
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

		<!-- Player Real -->
		<div class="w-full h-[calc(100%-28px)] bg-black">
			<div id="soniq-yt-iframe" class="w-full h-full"></div>
		</div>
	</div>
{:else}
	<!-- Modo de áudio em segundo plano (O iframe permanece no DOM para continuar tocando, conforme termos do YouTube) -->
	<div class="fixed -bottom-96 -right-96 opacity-0 pointer-events-none w-1 h-1 overflow-hidden" aria-hidden="true">
		<div id="soniq-yt-iframe"></div>
	</div>
{/if}
