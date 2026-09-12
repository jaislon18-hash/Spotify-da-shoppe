<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { searchYouTube } from '$lib/services/youtubeApi';
	import { apiKeyStore, isSettingsOpen } from '$lib/stores/appStore';
	import type { Track } from '$lib/types/music';
	import TrackCard from '$lib/components/track/TrackCard.svelte';
	import TrackRow from '$lib/components/track/TrackRow.svelte';
	import { Search, X, Loader2, LayoutGrid, List, KeyRound, Sparkles, Music } from '@lucide/svelte';

	let query = $state('');
	let tracks = $state<Track[]>([]);
	let isLoading = $state(false);
	let errorMessage = $state<string | null>(null);
	let isDemo = $state(false);
	let viewMode = $state<'grid' | 'list'>('list');

	let debounceTimer: any = null;

	const GENRE_CARDS = [
		{ name: 'Pop Hits', query: 'pop hits music', color: 'from-pink-500 to-rose-600' },
		{ name: 'Rock & Alternativo', query: 'rock classics music', color: 'from-amber-500 to-red-700' },
		{ name: 'Lofi & Relax', query: 'lofi hip hop chill beats', color: 'from-indigo-500 to-purple-700' },
		{ name: 'Eletrônica & Dance', query: 'electronic dance edm music', color: 'from-cyan-500 to-blue-700' },
		{ name: 'Hip Hop & Rap', query: 'hip hop rap music', color: 'from-emerald-500 to-teal-800' },
		{ name: 'MPB & Brasil', query: 'mpb classicos brasil', color: 'from-yellow-500 to-emerald-600' },
		{ name: 'Jazz & Blues', query: 'jazz blues relaxing', color: 'from-orange-600 to-amber-800' },
		{ name: 'Acústico & Piano', query: 'acoustic guitar piano', color: 'from-violet-600 to-fuchsia-800' }
	];

	async function performSearch(searchQuery: string) {
		if (!searchQuery.trim()) {
			tracks = [];
			errorMessage = null;
			return;
		}

		isLoading = true;
		errorMessage = null;

		try {
			const res = await searchYouTube(searchQuery, $apiKeyStore);
			tracks = res.tracks;
			isDemo = !!res.isDemoCatalog;
			if (res.error && res.isDemoCatalog) {
				errorMessage = res.error;
			}
		} catch (e: any) {
			errorMessage = e?.message || 'Erro ao realizar busca no YouTube.';
		} finally {
			isLoading = false;
		}
	}

	function onQueryInput() {
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			performSearch(query);
		}, 400);
	}

	function handleClear() {
		query = '';
		tracks = [];
		errorMessage = null;
	}

	function searchGenre(genreQuery: string) {
		query = genreQuery;
		performSearch(genreQuery);
	}

	onMount(() => {
		const paramQ = $page?.url?.searchParams?.get('q');
		if (paramQ) {
			query = paramQ;
			performSearch(paramQ);
		}
	});
</script>

<div class="space-y-8 max-w-7xl mx-auto">
	<!-- Barra de Pesquisa Principal -->
	<div class="relative max-w-2xl">
		<div class="relative flex items-center">
			<Search class="w-5 h-5 absolute left-4 text-slate-400" />
			<input
				type="text"
				bind:value={query}
				oninput={onQueryInput}
				placeholder="Pesquise por música, artista, álbum ou palavra-chave..."
				class="w-full pl-12 pr-12 py-3.5 rounded-2xl text-sm sm:text-base border outline-none shadow-lg transition-all focus:ring-2 focus:ring-indigo-500/50"
				style="background-color: var(--color-surface-card); border-color: var(--color-border-subtle); color: var(--color-text-main);"
			/>
			{#if query}
				<button
					onclick={handleClear}
					class="absolute right-4 p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
					title="Limpar pesquisa"
				>
					<X class="w-4 h-4" />
				</button>
			{/if}
		</div>
	</div>

	<!-- Aviso amigável quando em Modo Demonstração -->
	{#if isDemo && tracks.length > 0}
		<div
			class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border bg-amber-950/20 border-amber-500/30 text-amber-200 text-xs sm:text-sm"
		>
			<div class="flex items-center gap-2.5">
				<KeyRound class="w-5 h-5 text-amber-400 shrink-0" />
				<span>
					<strong>Modo Demonstração:</strong> Exibindo catálogo interno. Para pesquisar livremente qualquer música do mundo no YouTube, configure sua chave gratuita.
				</span>
			</div>
			<button
				onclick={() => isSettingsOpen.set(true)}
				class="px-3.5 py-1.5 rounded-xl font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 whitespace-nowrap transition-colors"
			>
				Configurar Chave
			</button>
		</div>
	{/if}

	<!-- Estado de Carregamento -->
	{#if isLoading}
		<div class="flex flex-col items-center justify-center py-20 text-slate-400">
			<Loader2 class="w-8 h-8 animate-spin text-indigo-500 mb-3" />
			<p class="text-sm">Buscando...</p>
		</div>
	{:else if query && tracks.length === 0}
		<!-- Nenhum resultado -->
		<div class="text-center py-20 text-slate-400">
			<Music class="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-400" />
			<h3 class="font-bold text-lg" style="color: var(--color-text-main);">Nenhum resultado encontrado</h3>
			<p class="text-xs sm:text-sm mt-1 text-slate-400">
				Tente pesquisar com outros termos ou confira sua chave da YouTube API.
			</p>
		</div>
	{:else if tracks.length > 0}
		<!-- Resultados da Pesquisa -->
		<div>
			<div class="flex items-center justify-between mb-4">
				<div>
					<h2 class="font-display font-bold text-lg sm:text-xl" style="color: var(--color-text-main);">
						Resultados para "{query}"
					</h2>
					<p class="text-xs text-slate-400">{tracks.length} músicas encontradas</p>
				</div>

				<!-- Seletor de Modo de Exibição (Grid vs Lista) -->
				<div class="flex items-center gap-1 p-1 rounded-xl border" style="background-color: var(--color-surface-card); border-color: var(--color-border-subtle);">
					<button
						onclick={() => viewMode = 'list'}
						class="p-1.5 rounded-lg transition-colors {viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}"
						title="Exibição em Lista"
					>
						<List class="w-4 h-4" />
					</button>
					<button
						onclick={() => viewMode = 'grid'}
						class="p-1.5 rounded-lg transition-colors {viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}"
						title="Exibição em Grade"
					>
						<LayoutGrid class="w-4 h-4" />
					</button>
				</div>
			</div>

			{#if viewMode === 'list'}
				<div class="space-y-1">
					{#each tracks as track, index (track.id + '-' + index)}
						<TrackRow {track} {index} playlistContext={tracks} />
					{/each}
				</div>
			{:else}
				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
					{#each tracks as track (track.id)}
						<TrackCard {track} playlistContext={tracks} />
					{/each}
				</div>
			{/if}
		</div>
	{:else}
		<!-- Tela Inicial de Busca: Categorias e Gêneros -->
		<div>
			<div class="flex items-center gap-2 mb-4">
				<Sparkles class="w-5 h-5 text-indigo-400" />
				<h2 class="font-display font-bold text-lg sm:text-xl" style="color: var(--color-text-main);">
					Navegar por Gêneros Musicais
				</h2>
			</div>

			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
				{#each GENRE_CARDS as genre}
					<button
						onclick={() => searchGenre(genre.query)}
						class="h-28 sm:h-36 rounded-2xl p-4 bg-gradient-to-br {genre.color} text-white font-display font-bold text-base sm:text-lg flex flex-col justify-between shadow-lg hover:scale-103 active:scale-97 transition-all duration-200 text-left overflow-hidden relative group"
					>
						<span>{genre.name}</span>
						<div class="self-end opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all">
							<Music class="w-8 h-8 sm:w-10 sm:h-10" />
						</div>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
