<script lang="ts">
	import { page } from '$app/stores';
	import { Home, Search, Library, Plus, Heart, Music2, Sparkles } from '@lucide/svelte';
	import { getPlaylists } from '$lib/db';
	import type { Playlist } from '$lib/types/music';
	import { openPlaylistModal } from '$lib/stores/appStore';
	import { onMount } from 'svelte';

	let playlists = $state<Playlist[]>([]);
	let currentPath = $derived($page?.url?.pathname || '');
	let currentParamId = $derived($page?.params?.id || '');

	async function loadPlaylists() {
		playlists = await getPlaylists();
	}

	onMount(() => {
		loadPlaylists();

		// Escuta evento customizado de atualização de playlists
		const handleUpdate = () => loadPlaylists();
		window.addEventListener('soniq-playlists-updated', handleUpdate);
		return () => window.removeEventListener('soniq-playlists-updated', handleUpdate);
	});
</script>

<aside
	class="w-64 shrink-0 h-full flex flex-col p-4 select-none hidden md:flex border-r transition-colors duration-200"
	style="background-color: var(--color-surface-elevated); border-color: var(--color-border-subtle);"
>
	<!-- Brand Logo Soniq -->
	<a href="/" class="flex items-center gap-3 px-3 py-4 mb-4 group">
		<div class="relative w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 group-hover:scale-105 transition-transform">
			<!-- Visualizer bars dentro do logo -->
			<div class="flex items-end gap-0.5 h-5">
				<span class="w-1 bg-white rounded-full eq-bar-1"></span>
				<span class="w-1 bg-white rounded-full eq-bar-2"></span>
				<span class="w-1 bg-white rounded-full eq-bar-3"></span>
				<span class="w-1 bg-white rounded-full eq-bar-4"></span>
			</div>
		</div>
		<div>
			<span class="font-display font-black text-2xl tracking-tight text-gradient">Soniq</span>
			<span class="block text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">Player Pessoal</span>
		</div>
	</a>

	<!-- Navegação Principal -->
	<nav class="space-y-1.5 mb-6">
		<a
			href="/"
			class="flex items-center gap-4 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 {currentPath === '/' ? 'bg-indigo-600/15 text-indigo-500 font-bold' : 'hover:bg-white/5 opacity-80 hover:opacity-100'}"
			style="color: {currentPath === '/' ? 'var(--color-accent)' : 'var(--color-text-main)'};"
		>
			<Home class="w-5 h-5" />
			<span>Início</span>
		</a>

		<a
			href="/search"
			class="flex items-center gap-4 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 {currentPath.startsWith('/search') ? 'bg-indigo-600/15 text-indigo-500 font-bold' : 'hover:bg-white/5 opacity-80 hover:opacity-100'}"
			style="color: {currentPath.startsWith('/search') ? 'var(--color-accent)' : 'var(--color-text-main)'};"
		>
			<Search class="w-5 h-5" />
			<span>Pesquisar</span>
		</a>

		<a
			href="/library"
			class="flex items-center gap-4 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 {currentPath.startsWith('/library') ? 'bg-indigo-600/15 text-indigo-500 font-bold' : 'hover:bg-white/5 opacity-80 hover:opacity-100'}"
			style="color: {currentPath.startsWith('/library') ? 'var(--color-accent)' : 'var(--color-text-main)'};"
		>
			<Library class="w-5 h-5" />
			<span>Sua Biblioteca</span>
		</a>
	</nav>

	<!-- Divisor -->
	<div class="h-px mb-4" style="background-color: var(--color-border-subtle);"></div>

	<!-- Playlists Cabeçalho & Ação de Criar -->
	<div class="flex items-center justify-between px-3 mb-2">
		<span class="text-xs font-bold uppercase tracking-wider text-slate-400">Playlists</span>
		<button
			onclick={() => openPlaylistModal()}
			class="p-1.5 rounded-lg transition-colors hover:scale-110 active:scale-95"
			style="background-color: var(--color-surface-card); color: var(--color-text-main);"
			title="Criar nova playlist"
		>
			<Plus class="w-4 h-4" />
		</button>
	</div>

	<!-- Lista de Playlists com Rolagem Suave -->
	<div class="flex-1 overflow-y-auto space-y-1 pr-1">
		<!-- Playlist Fixa: Músicas Curtidas -->
		<a
			href="/library?tab=favorites"
			class="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150 hover:bg-white/5 group"
		>
			<div class="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-sm">
				<Heart class="w-4 h-4 fill-white" />
			</div>
			<div class="truncate">
				<span class="font-medium block truncate text-xs sm:text-sm">Músicas Curtidas</span>
			</div>
		</a>

		<!-- Playlists do Usuário -->
		{#each playlists as pl (pl.id)}
			<a
				href="/playlist/{pl.id}"
				class="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150 hover:bg-white/5 group {currentParamId === pl.id ? 'bg-indigo-600/10 font-semibold text-indigo-400' : ''}"
				style="color: {currentParamId === pl.id ? 'var(--color-accent)' : 'var(--color-text-main)'};"
			>
				<div class="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br {pl.color || 'from-indigo-600 to-cyan-500'} text-white shrink-0 shadow-sm">
					<Music2 class="w-4 h-4" />
				</div>
				<div class="truncate">
					<span class="font-medium block truncate text-xs sm:text-sm">{pl.name}</span>
					<span class="text-[11px] text-slate-400 block">{pl.tracks.length} {pl.tracks.length === 1 ? 'música' : 'músicas'}</span>
				</div>
			</a>
		{/each}
	</div>
</aside>
