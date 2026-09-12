<script lang="ts">
	import { page } from '$app/stores';
	import { Home, Search, Library, Settings } from '@lucide/svelte';
	import { isSettingsOpen } from '$lib/stores/appStore';

	let currentPath = $derived($page?.url?.pathname || '');
</script>

<nav
	class="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around py-2.5 px-2 backdrop-blur-xl border-t transition-colors duration-200"
	style="background-color: var(--color-surface-player); border-color: var(--color-border-subtle); padding-bottom: max(0.625rem, env(safe-area-inset-bottom));"
>
	<a
		href="/"
		class="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all duration-150 active:scale-95 {currentPath === '/' ? 'text-indigo-500 font-bold' : 'opacity-60 hover:opacity-100'}"
		style="color: {currentPath === '/' ? 'var(--color-accent)' : 'var(--color-text-main)'};"
	>
		<Home class="w-5 h-5" />
		<span class="text-[10px] tracking-tight">Início</span>
	</a>

	<a
		href="/search"
		class="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all duration-150 active:scale-95 {currentPath.startsWith('/search') ? 'text-indigo-500 font-bold' : 'opacity-60 hover:opacity-100'}"
		style="color: {currentPath.startsWith('/search') ? 'var(--color-accent)' : 'var(--color-text-main)'};"
	>
		<Search class="w-5 h-5" />
		<span class="text-[10px] tracking-tight">Buscar</span>
	</a>

	<a
		href="/library"
		class="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all duration-150 active:scale-95 {currentPath.startsWith('/library') ? 'text-indigo-500 font-bold' : 'opacity-60 hover:opacity-100'}"
		style="color: {currentPath.startsWith('/library') ? 'var(--color-accent)' : 'var(--color-text-main)'};"
	>
		<Library class="w-5 h-5" />
		<span class="text-[10px] tracking-tight">Biblioteca</span>
	</a>

	<button
		onclick={() => isSettingsOpen.set(true)}
		class="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all duration-150 active:scale-95 opacity-60 hover:opacity-100"
		style="color: var(--color-text-main);"
	>
		<Settings class="w-5 h-5" />
		<span class="text-[10px] tracking-tight">Ajustes</span>
	</button>
</nav>
