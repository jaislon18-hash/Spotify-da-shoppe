<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import { initializeDatabase, getSettings } from '$lib/db';
	import { initAppTheme } from '$lib/stores/appStore';
	import { playerStore, seekTo, playTrack } from '$lib/stores/playerStore';

	// Componentes Estruturais
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import BottomNav from '$lib/components/layout/BottomNav.svelte';

	// Players e Integração
	import DesktopPlayer from '$lib/components/player/DesktopPlayer.svelte';
	import MobilePlayer from '$lib/components/player/MobilePlayer.svelte';
	import YouTubeIframe from '$lib/components/player/YouTubeIframe.svelte';
	import QueuePanel from '$lib/components/player/QueuePanel.svelte';
	import OledSleepOverlay from '$lib/components/player/OledSleepOverlay.svelte';

	// Modais & Notificações
	import Toast from '$lib/components/ui/Toast.svelte';
	import SettingsModal from '$lib/components/modals/SettingsModal.svelte';
	import PlaylistModal from '$lib/components/modals/PlaylistModal.svelte';
	import AddToPlaylistModal from '$lib/components/modals/AddToPlaylistModal.svelte';

	let { children } = $props();

	onMount(async () => {
		// Inicializa banco de dados IndexedDB
		await initializeDatabase();
		// Inicializa tema e configurações
		await initAppTheme();

		// Restaura última sessão de reprodução se houver
		try {
			const settings = await getSettings();
			if (settings.lastTrack) {
				playerStore.update((s) => ({
					...s,
					currentTrack: settings.lastTrack || null,
					currentTime: settings.lastPosition || 0,
					volume: settings.volume !== undefined ? settings.volume : 80,
					isMuted: !!settings.isMuted,
					repeatMode: settings.repeatMode || 'off',
					isShuffle: !!settings.shuffle
				}));
			}
		} catch (e) {
			console.error('Erro ao restaurar última sessão:', e);
		}
	});
</script>

<div class="flex h-screen w-screen overflow-hidden text-foreground selection:bg-indigo-500 selection:text-white"
	style="background-color: var(--color-surface-base);">
	<!-- Barra Lateral Desktop -->
	<Sidebar />

	<!-- Área Principal (Cabeçalho + Conteúdo Rolável) -->
	<div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
		<Header />

		<!-- Área de Conteúdo da Rota com rolagem suave e espaço para os players -->
		<main
			class="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8 pb-36 md:pb-28 transition-colors duration-200"
		>
			{@render children()}
		</main>
	</div>
</div>

<!-- Player do YouTube (IFrame) -->
<YouTubeIframe />

<!-- Player Compacto Fixo para Computador -->
<DesktopPlayer />

<!-- Mini-player e Expansor em Tela Cheia para Celular -->
<MobilePlayer />

<!-- Barra de Navegação Inferior para Celular -->
<BottomNav />

<!-- Painel Lateral da Fila de Reprodução -->
<QueuePanel />

<!-- Modais Globais -->
<SettingsModal />
<PlaylistModal />
<AddToPlaylistModal />

<!-- Sistema de Notificações Toast -->
<Toast />

<!-- Modo Noturno / Economia de Bateria OLED em Tela Cheia -->
<OledSleepOverlay />

