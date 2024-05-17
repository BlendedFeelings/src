<script lang="ts">
	import type { ContentItem } from "./ContentService";
    export let item:ContentItem;
    export let view:string|null;
</script>
{#if item && item.cumulativePath}
<div class="dir">
{#each item.cumulativePath as segment, i}
    {#if i > 0}<span>/</span>{/if}<a href={`/${segment.path}` + (view ? `?v=${view}` : '')} class="text-normal">{segment.name}</a>
{/each}
</div>
{/if}

<style>
    .dir {
        font-family: monospace;
        white-space: nowrap;
    }
</style>