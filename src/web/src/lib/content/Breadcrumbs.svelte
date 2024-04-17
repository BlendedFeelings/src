<script lang="ts">
	import type { ContentItem } from "./ContentService";
	export let view:string|null|undefined;
    export let query:string|null|undefined;
    export let folder:ContentItem|null|undefined;

    function toQueryString(params:Record<string, string|null|undefined>) {
        return Object.keys(params)
            .filter(k => params[k] != null)
            .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]!))
            .join('&');
    }
</script>

{#if folder}
<div class="breadcrumbs">
    in <a href="/">..</a>{#if folder?.cumulativePath}{#each folder?.cumulativePath as segment}<span class="separator">/</span><a href="/{segment.path}?{toQueryString({'v':view, 'q':query})}">{segment.name}</a>{/each}{/if}
</div>
{/if}

<style>
    .breadcrumbs {
        font-family: monospace;
        color: #2a8b2a;
    }
    .separator {
        width:15px;
        display: inline-block;
        text-align: center;
        font-size: .9em;
    }
</style>