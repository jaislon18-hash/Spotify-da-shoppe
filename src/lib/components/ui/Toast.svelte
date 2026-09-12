<script lang="ts">
	import { toasts } from '$lib/stores/toastStore';
	import { CheckCircle2, AlertCircle, Info, X } from '@lucide/svelte';
</script>

{#if $toasts.length > 0}
	<div class="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
		{#each $toasts as toast (toast.id)}
			<div
				class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-4 border {toast.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-100' : toast.type === 'error' ? 'bg-rose-950/80 border-rose-500/30 text-rose-100' : toast.type === 'warning' ? 'bg-amber-950/80 border-amber-500/30 text-amber-100' : 'bg-slate-900/90 border-white/10 text-white'}"
			>
				{#if toast.type === 'success'}
					<CheckCircle2 class="w-5 h-5 text-emerald-400 shrink-0" />
				{:else if toast.type === 'error'}
					<AlertCircle class="w-5 h-5 text-rose-400 shrink-0" />
				{:else}
					<Info class="w-5 h-5 text-indigo-400 shrink-0" />
				{/if}

				<span class="text-sm font-medium">{toast.message}</span>
			</div>
		{/each}
	</div>
{/if}
