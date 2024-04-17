<script lang="ts">
    import type { Span } from 'indexer';
    import Error from '$lib/icons/error.svg?raw';
    import OK from '$lib/icons/ok.svg?raw';
    import Plus from '$lib/icons/plus.svg?raw'
    import Minus from '$lib/icons/minus.svg?raw'
    export let span:Span
    export let expanded = false;
</script>

<div>
    <div class="nowrap">
        {#if span.children || span.logs}
            <span on:click={() => expanded = !expanded}>
                {#if expanded}
                    {@html Minus}
                {:else}
                    {@html Plus}
                {/if}
            </span>
        {:else}
            <span>
                {@html Minus}
            </span>
        {/if}
        {span.attributes?.type || ''} {span.spanName}
        {#if span.statusCode == 'ERROR'}
            <span class="error">{@html Error}</span>
        {:else if span.statusCode == 'WARNING'}
            <span class="warning">{@html OK}</span>
        {:else if span.statusCode == 'SKIPPED'}
            <span class="text-secondary">{@html OK}</span>
        {:else if span.statusCode == 'OK'}
            <span class="ok">{@html OK}</span>
        {/if}
    </div>
    {#if expanded}
    <div class="ml-1">
        {#each span.logs as log}
            <div class="nowrap text-secondary">{log.logLevel} {log.logger} {log.message}</div>
        {/each}
        {#if span.children}
            {#each span.children as childSpan}
                <div class="ml-1">
                <svelte:self span={childSpan}/>
                </div>
            {/each}
        {/if}
    </div>
    {/if}
</div>

<style>
    .error {
        color: #dc3545;
    }
    .warning {
        color: #ffc107;
    }
    .ok {
        color: #28a745;
    }
    .nowrap {
        white-space: nowrap;
    }
</style>