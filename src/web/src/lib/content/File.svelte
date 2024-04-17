<script lang="ts">
	import Markdown from "$lib/markdown/components/Markdown.svelte";
	import type { ContentItem } from "./ContentService";
    import { toQueryString } from "./QueryString";
    export let item:ContentItem|null;
    export let view:string|null;
    export let query:string|null;


</script>
<div>
{#if item}
    <div class="item">
        <div class="path">
        {#if item.folder?.cumulativePath}
            {#each item.folder.cumulativePath as segment, i}
                {#if i > 0}<small class="segment">/</small>{/if}<small><a href={`/${segment.path}${toQueryString({'v':view,'q':query})}`} class="segment">{segment.name}</a></small>
            {/each}
        {/if}
        </div>
        <Markdown children={item.tokens}/>
    </div>
{/if}
</div>
<style>
	:global(.item p) {
		margin-block-start: 0px;
	}
	.item {
		margin-bottom: 4rem;
	}
	.path {
    }
    .path .segment {
        color: rgb(114, 114, 114);
    }
</style>