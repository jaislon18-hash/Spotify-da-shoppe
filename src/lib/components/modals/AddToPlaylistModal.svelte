<script lang="ts">
	import {
		isAddToPlaylistOpen,
		trackForPlaylist,
		closeAddToPlaylist,
		openPlaylistModal
	} from '$lib/stores/appStore';
	import { getPlaylists, addTrackToPlaylist } from '$lib/db';
	import type { Playlist } from '$lib/types/music';
	import { showToast } from '$lib/stores/toastStore';
	import { X, ListPlus, Plus, Music2, Check } from '@lucide/svelte';

	let playlists = $state<Playlist[]>([]);

	$effect(() => {
		if ($isAddToPlaylistOpen) {
			getPlaylists().then((res) => {
				playlists = res;
			});
		}
	});

	async function handleAddTo(playlist: Playlist) {
		if (!$trackForPlaylist) return;
		const added = await addTrackToPlaylist(playlist.id, $trackForPlaylist);
		if (added) {
			showToast(`Música adicionada à playlist "${playlist.name}"!`, 'success');
			window.dispatchEvent(new CustomEvent('soniq-playlists-updated'));
		} else {
			showToast(`A faixa já está na playlist "${playlist.name}".`, 'info');
		}
		closeAddToPlaylist();
	}

	function handleCreateNew() {
		closeAddToPlaylist();
		openPlaylistModal();
	}
</script>

{#if $isAddToPlaylistOpen && $trackForPlaylist}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
		onclick={closeAddToPlaylist}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && closeAddToPlaylist()}
	>
		<div
			class="relative w-full max-w-sm rounded-3xl shadow-2xl border p-6 max-h-[85vh] flex flex-col"
			style="background-color: var(--color-surface-elevated); border-color: var(--color-border-subtle); color: var(--color-text-main);"
			onclick={(e) => e.stopPropagation()}
			role="presentation"
		>
			<!-- Cabeçalho -->
			<div class="flex items-center justify-between pb-4 mb-4 border-b shrink-0" style="border-color: var(--color-border-subtle);">
				<div class="flex items-center gap-2.5 min-w-0">
					<div class="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
						<ListPlus class="w-4 h-4" />
					</div>
					<div class="truncate">
						<h3 class="font-display font-bold text-base truncate">Adicionar à Playlist</h3>
						<p class="text-xs text-slate-400 truncate">{$trackForPlaylist.title}</p>
					</div>
				</div>

				<button
					onclick={closeAddToPlaylist}
					class="p-2 rounded-xl hover:bg-white/10 transition-colors shrink-0"
					title="Fechar"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<!-- Botão Nova Playlist -->
			<button
				onclick={handleCreateNew}
				class="flex items-center gap-3 p-3 rounded-2xl mb-3 border border-dashed transition-all hover:bg-white/5 active:scale-98 shrink-0"
				style="border-color: var(--color-border-hover);"
			>
				<div class="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
					<Plus class="w-4 h-4" />
				</div>
				<div class="text-left">
					<span class="font-semibold text-xs block">Criar Nova Playlist</span>
					<span class="text-[11px] text-slate-400 block">Salvar esta música em uma nova lista</span>
				</div>
			</button>

			<!-- Lista de Playlists Existentes -->
			<div class="flex-1 overflow-y-auto space-y-1 pr-1">
				{#if playlists.length === 0}
					<div class="py-6 text-center text-slate-400 text-xs">
						Nenhuma playlist encontrada. Crie uma acima!
					</div>
				{:else}
					{#each playlists as pl}
						<button
							onclick={() => handleAddTo(pl)}
							class="w-full flex items-center justify-between gap-3 p-2.5 rounded-xl transition-colors hover:bg-white/5 text-left group"
						>
							<div class="flex items-center gap-3 truncate">
								<div class="w-9 h-9 rounded-xl bg-gradient-to-tr {pl.color} text-white flex items-center justify-center shadow-sm shrink-0">
									<Music2 class="w-4 h-4" />
								</div>
								<div class="truncate">
									<span class="font-medium text-xs block truncate">{pl.name}</span>
									<span class="text-[10px] text-slate-400 block">{pl.tracks.length} músicas</span>
								</div>
							</div>

							<div class="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400">
								<Plus class="w-3.5 h-3.5" />
							</div>
						</button>
					{/each}
				{/if}
			</div>
		</div>
	</div>
{/if}
