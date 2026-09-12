<script lang="ts">
	import { goto } from '$app/navigation';
	import { Search, Sun, Moon, Settings, ChevronLeft, ChevronRight, KeyRound, Sparkles } from '@lucide/svelte';
	import { themeStore, toggleTheme, apiKeyStore, isSettingsOpen } from '$lib/stores/appStore';

	let searchQuery = $state('');

	function handleSearch(e: SubmitEvent) {
		e.preventDefault();
		if (searchQuery.trim()) {
			goto(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
		}
	}

	function goBack() {
		if (typeof window !== 'undefined') window.history.back();
	}

	function goForward() {
		if (typeof window !== 'undefined') window.history.forward();
	}
</script>

<header class="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3.5 backdrop-blur-xl border-b transition-colors duration-200"
	style="background-color: var(--color-surface-player); border-color: var(--color-border-subtle);">
	<!-- Navegação de histórico e Busca rápida -->
	<div class="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
		<!-- Botões de voltar/avançar (Desktop) -->
		<div class="hidden md:flex items-center gap-1.5">
			<button
				onclick={goBack}
				class="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:scale-105 active:scale-95"
				style="background-color: var(--color-surface-card); color: var(--color-text-main);"
				title="Voltar"
			>
				<ChevronLeft class="w-4 h-4" />
			</button>
			<button
				onclick={goForward}
				class="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:scale-105 active:scale-95"
				style="background-color: var(--color-surface-card); color: var(--color-text-main);"
				title="Avançar"
			>
				<ChevronRight class="w-4 h-4" />
			</button>
		</div>

		<!-- Formulário de busca rápida na barra superior (Desktop) -->
		<form onsubmit={handleSearch} class="relative w-full max-w-md hidden sm:block">
			<Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="O que você quer ouvir hoje?"
				class="w-full pl-10 pr-4 py-2 text-sm rounded-full transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/50"
				style="background-color: var(--color-surface-card); color: var(--color-text-main); border: 1px solid var(--color-border-subtle);"
			/>
		</form>
	</div>

	<!-- Ações à direita: Status da API, Tema, Configurações -->
	<div class="flex items-center gap-2 sm:gap-3">
		<!-- Pill do Status da API do YouTube -->
		<button
			onclick={() => isSettingsOpen.set(true)}
			class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-102 border"
			style="background-color: var(--color-surface-card); border-color: var(--color-border-subtle); color: var(--color-text-main);"
			title="Clique para configurar a YouTube Data API"
		>
			{#if $apiKeyStore}
				<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
				<span class="hidden sm:inline">YouTube Conectado</span>
				<span class="sm:hidden">API OK</span>
			{:else}
				<span class="w-2 h-2 rounded-full bg-amber-400"></span>
				<span class="hidden sm:inline">Modo Demonstração</span>
				<KeyRound class="w-3.5 h-3.5 text-amber-400 sm:hidden" />
			{/if}
		</button>

		<!-- Alternador de Tema Escuro / Claro -->
		<button
			onclick={toggleTheme}
			class="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 border"
			style="background-color: var(--color-surface-card); border-color: var(--color-border-subtle); color: var(--color-text-main);"
			title={$themeStore === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
		>
			{#if $themeStore === 'dark'}
				<Sun class="w-4 h-4 text-amber-300" />
			{:else}
				<Moon class="w-4 h-4 text-indigo-600" />
			{/if}
		</button>

		<!-- Botão de Configurações -->
		<button
			onclick={() => isSettingsOpen.set(true)}
			class="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 border"
			style="background-color: var(--color-surface-card); border-color: var(--color-border-subtle); color: var(--color-text-main);"
			title="Configurações do Soniq"
		>
			<Settings class="w-4 h-4" />
		</button>
	</div>
</header>
