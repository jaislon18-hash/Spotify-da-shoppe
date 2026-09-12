<script lang="ts">
	import { isSettingsOpen, apiKeyStore } from '$lib/stores/appStore';
	import { getSettings, saveSettings, db } from '$lib/db';
	import { testApiKey } from '$lib/services/youtubeApi';
	import { showToast } from '$lib/stores/toastStore';
	import { X, Key, CheckCircle2, AlertCircle, ExternalLink, Trash2, HelpCircle, ShieldCheck } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let inputKey = $state(
		typeof window !== 'undefined' ? localStorage.getItem('soniq_yt_api_key') || '' : ''
	);
	let isTesting = $state(false);
	let testResult = $state<{ valid: boolean; message: string } | null>(null);

	$effect(() => {
		if ($isSettingsOpen) {
			inputKey = $apiKeyStore || (typeof window !== 'undefined' ? localStorage.getItem('soniq_yt_api_key') || '' : '');
		}
	});

	onMount(async () => {
		const s = await getSettings();
		if (s.youtubeApiKey) {
			inputKey = s.youtubeApiKey;
		}
	});

	async function handleTest() {
		isTesting = true;
		testResult = null;
		const res = await testApiKey(inputKey);
		testResult = res;
		isTesting = false;
	}

	async function handleSave() {
		await saveSettings({ youtubeApiKey: inputKey.trim() });
		apiKeyStore.set(inputKey.trim());
		showToast('Configurações salvas com sucesso!', 'success');
		isSettingsOpen.set(false);
	}

	async function handleClearHistory() {
		if (confirm('Tem certeza que deseja limpar todo o seu histórico de músicas ouvidas?')) {
			await db.history.clear();
			showToast('Histórico limpo com sucesso!', 'info');
		}
	}

	async function handleResetAll() {
		if (confirm('Atenção: Isso excluirá todas as playlists, favoritos e histórico locais do Soniq. Deseja continuar?')) {
			await db.delete();
			location.reload();
		}
	}
</script>

{#if $isSettingsOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
		onclick={() => isSettingsOpen.set(false)}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && isSettingsOpen.set(false)}
	>
		<div
			class="relative w-full max-w-lg rounded-3xl shadow-2xl border p-6 max-h-[90vh] overflow-y-auto"
			style="background-color: var(--color-surface-elevated); border-color: var(--color-border-subtle); color: var(--color-text-main);"
			onclick={(e) => e.stopPropagation()}
			role="presentation"
		>
			<!-- Cabeçalho -->
			<div class="flex items-center justify-between pb-4 mb-4 border-b" style="border-color: var(--color-border-subtle);">
				<div class="flex items-center gap-2.5">
					<div class="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
						<Key class="w-5 h-5" />
					</div>
					<div>
						<h3 class="font-display font-bold text-lg leading-tight">Configurações do Soniq</h3>
						<p class="text-xs text-slate-400">Gerencie sua chave do YouTube e dados locais</p>
					</div>
				</div>

				<button
					onclick={() => isSettingsOpen.set(false)}
					class="p-2 rounded-xl hover:bg-white/10 transition-colors"
					title="Fechar"
				>
					<X class="w-5 h-5" />
				</button>
			</div>

			<!-- Campo da YouTube Data API v3 -->
			<div class="space-y-4 mb-6">
				<div>
					<label for="yt-key-input" class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
						Chave da YouTube Data API v3
					</label>
					<div class="relative">
						<input
							id="yt-key-input"
							type="text"
							bind:value={inputKey}
							placeholder="Ex: AIzaSyD..."
							class="w-full px-3.5 py-2.5 text-sm rounded-xl font-mono border outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
							style="background-color: var(--color-surface-card); border-color: var(--color-border-subtle); color: var(--color-text-main);"
						/>
					</div>
					<p class="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
						Sua chave é armazenada com 100% de privacidade apenas no IndexedDB do seu navegador.
					</p>
				</div>

				<!-- Botões de Teste e Salvar -->
				<div class="flex items-center gap-2">
					<button
						onclick={handleTest}
						disabled={isTesting || !inputKey.trim()}
						class="px-4 py-2 rounded-xl text-xs font-semibold border transition-all hover:bg-white/5 active:scale-95 disabled:opacity-40"
						style="border-color: var(--color-border-subtle);"
					>
						{isTesting ? 'Testando conexão...' : 'Testar Conexão'}
					</button>

					<button
						onclick={handleSave}
						class="flex-1 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-md shadow-indigo-500/20 active:scale-95 transition-transform"
					>
						Salvar Chave
					</button>
				</div>

				<!-- Feedback de Teste -->
				{#if testResult}
					<div
						class="p-3 rounded-xl text-xs flex items-start gap-2.5 border {testResult.valid ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/40 border-rose-500/30 text-rose-300'}"
					>
						{#if testResult.valid}
							<CheckCircle2 class="w-4 h-4 shrink-0 text-emerald-400" />
						{:else}
							<AlertCircle class="w-4 h-4 shrink-0 text-rose-400" />
						{/if}
						<span>{testResult.message}</span>
					</div>
				{/if}

				<!-- Guia Passo a Passo para Gerar a Chave Gratuita -->
				<div
					class="p-4 rounded-2xl border text-xs space-y-2.5"
					style="background-color: var(--color-surface-card); border-color: var(--color-border-subtle);"
				>
					<div class="flex items-center justify-between text-indigo-400 font-semibold">
						<span class="flex items-center gap-1.5">
							<HelpCircle class="w-4 h-4" />
							Como obter sua chave gratuita (em 2 minutos)
						</span>
						<a
							href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
							target="_blank"
							rel="noreferrer"
							class="flex items-center gap-1 text-[11px] underline hover:text-indigo-300"
						>
							Abrir Console <ExternalLink class="w-3 h-3" />
						</a>
					</div>

					<ol class="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
						<li>Acesse o <strong class="text-white">Google Cloud Console</strong> com sua conta Google.</li>
						<li>Crie um projeto gratuito com qualquer nome (ex: <em>Soniq</em>).</li>
						<li>Ative a <strong class="text-white">YouTube Data API v3</strong> na biblioteca de APIs.</li>
						<li>Vá na aba <strong class="text-white">Credenciais</strong> &gt; <strong class="text-white">+ Criar credenciais</strong> &gt; <strong class="text-white">Chave de API</strong>.</li>
						<li>Copie o código gerado e cole no campo acima!</li>
					</ol>
				</div>
			</div>

			<!-- Seção de Dados e Armazenamento -->
			<div class="pt-4 border-t space-y-3" style="border-color: var(--color-border-subtle);">
				<span class="block text-xs font-bold uppercase tracking-wider text-slate-400">Armazenamento Local (IndexedDB)</span>

				<div class="flex items-center justify-between gap-3">
					<button
						onclick={handleClearHistory}
						class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border transition-all"
						style="border-color: var(--color-border-subtle);"
					>
						<Trash2 class="w-3.5 h-3.5" />
						<span>Limpar Histórico</span>
					</button>

					<button
						onclick={handleResetAll}
						class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all"
					>
						<span>Redefinir Banco Local</span>
					</button>
				</div>
			</div>

			<!-- Rodapé -->
			<div class="pt-4 mt-4 border-t text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5" style="border-color: var(--color-border-subtle);">
				<ShieldCheck class="w-3.5 h-3.5 text-emerald-500" />
				<span>Soniq v1.0.0 — Player Pessoal sem anúncios próprios</span>
			</div>
		</div>
	</div>
{/if}
