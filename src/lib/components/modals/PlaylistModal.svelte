<script lang="ts">
	import { isPlaylistModalOpen, playlistEditing, closePlaylistModal } from '$lib/stores/appStore';
	import { createPlaylist, updatePlaylist } from '$lib/db';
	import { showToast } from '$lib/stores/toastStore';
	import { X, Music2, Palette, Sparkles } from '@lucide/svelte';

	const COLOR_PRESETS = [
		{ id: 'from-indigo-600 to-cyan-500', label: 'Índigo & Ciano' },
		{ id: 'from-purple-600 to-pink-500', label: 'Violeta & Neon' },
		{ id: 'from-amber-500 to-rose-600', label: 'Pôr do Sol' },
		{ id: 'from-emerald-500 to-teal-700', label: 'Esmeralda' },
		{ id: 'from-fuchsia-600 to-indigo-700', label: 'Cyberpunk' },
		{ id: 'from-blue-600 to-violet-800', label: 'Noite Profunda' }
	];

	let name = $state('');
	let description = $state('');
	let selectedColor = $state(COLOR_PRESETS[0].id);

	$effect(() => {
		if ($playlistEditing) {
			name = $playlistEditing.name;
			description = $playlistEditing.description || '';
			selectedColor = $playlistEditing.color || COLOR_PRESETS[0].id;
		} else {
			name = '';
			description = '';
			selectedColor = COLOR_PRESETS[0].id;
		}
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!name.trim()) return;

		if ($playlistEditing) {
			await updatePlaylist($playlistEditing.id, {
				name: name.trim(),
				description: description.trim(),
				color: selectedColor
			});
			showToast('Playlist atualizada com sucesso!', 'success');
		} else {
			await createPlaylist(name.trim(), description.trim(), selectedColor);
			showToast('Playlist criada com sucesso!', 'success');
		}

		window.dispatchEvent(new CustomEvent('soniq-playlists-updated'));
		closePlaylistModal();
	}
</script>

{#if $isPlaylistModalOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
		onclick={closePlaylistModal}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && closePlaylistModal()}
	>
		<div
			class="relative w-full max-w-md rounded-3xl shadow-2xl border p-6"
			style="background-color: var(--color-surface-elevated); border-color: var(--color-border-subtle); color: var(--color-text-main);"
			onclick={(e) => e.stopPropagation()}
			role="presentation"
		>
			<!-- Cabeçalho -->
			<div class="flex items-center justify-between pb-4 mb-4 border-b" style="border-color: var(--color-border-subtle);">
				<div class="flex items-center gap-2.5">
					<div class="w-9 h-9 rounded-xl bg-gradient-to-tr {$playlistEditing ? $playlistEditing.color : selectedColor} text-white flex items-center justify-center shadow-md">
						<Music2 class="w-5 h-5" />
					</div>
					<div>
						<h3 class="font-display font-bold text-lg leading-tight">
							{$playlistEditing ? 'Editar Playlist' : 'Nova Playlist'}
						</h3>
						<p class="text-xs text-slate-400">Personalize sua coleção de faixas</p>
					</div>
				</div>

				<button
					onclick={closePlaylistModal}
					class="p-2 rounded-xl hover:bg-white/10 transition-colors"
					title="Fechar"
				>
					<X class="w-5 h-5" />
				</button>
			</div>

			<!-- Formulário -->
			<form onsubmit={handleSubmit} class="space-y-4">
				<div>
					<label for="pl-name" class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
						Nome da Playlist *
					</label>
					<input
						id="pl-name"
						type="text"
						bind:value={name}
						placeholder="Minhas Músicas Favoritas"
						required
						class="w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
						style="background-color: var(--color-surface-card); border-color: var(--color-border-subtle); color: var(--color-text-main);"
					/>
				</div>

				<div>
					<label for="pl-desc" class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
						Descrição (opcional)
					</label>
					<textarea
						id="pl-desc"
						bind:value={description}
						rows="2"
						placeholder="Músicas para ouvir no final de semana..."
						class="w-full px-3.5 py-2 text-sm rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
						style="background-color: var(--color-surface-card); border-color: var(--color-border-subtle); color: var(--color-text-main);"
					></textarea>
				</div>

				<!-- Paleta de Cores da Capa -->
				<div>
					<span class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
						Gradiente da Capa
					</span>
					<div class="grid grid-cols-6 gap-2">
						{#each COLOR_PRESETS as preset}
							<button
								type="button"
								onclick={() => selectedColor = preset.id}
								class="h-9 rounded-xl bg-gradient-to-tr {preset.id} transition-all hover:scale-105 active:scale-95 flex items-center justify-center {selectedColor === preset.id ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-105' : 'opacity-70 hover:opacity-100'}"
								title={preset.label}
							>
								{#if selectedColor === preset.id}
									<Sparkles class="w-3.5 h-3.5 text-white" />
								{/if}
							</button>
						{/each}
					</div>
				</div>

				<div class="flex items-center justify-end gap-2 pt-2">
					<button
						type="button"
						onclick={closePlaylistModal}
						class="px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all hover:bg-white/5 active:scale-95"
						style="border-color: var(--color-border-subtle);"
					>
						Cancelar
					</button>

					<button
						type="submit"
						disabled={!name.trim()}
						class="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-md shadow-indigo-500/20 active:scale-95 transition-transform disabled:opacity-40"
					>
						{$playlistEditing ? 'Salvar Alterações' : 'Criar Playlist'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
