<script lang="ts">
	import File from '$lib/content/File.svelte';
	import type { Content } from './ContentService';
	export let data: Content;
</script>

<svelte:head>
	<title>{data.item?.title} | BlendedFeelings</title>
</svelte:head>

{#if data.item?.sourceUri}
<div class="edit-this">
    <small><a href={data.item.sourceUri} class="text-normal">Edit this</a></small>
</div>
{/if}
<File item={data.item} view={data.view} query={data.query}></File>

{#if data.items}

    <div class="mb-3 mt-6">

        <div class="related text-muted">
            «ã�“ã‚“ã�«ã�¡ã�¯ã�“ã‚“ã�«ã�¡ã�¯ã�“ã‚“ã�«ã�¡ã�¯ã�“ã‚“ã�«ã�¡ã�¯ã�“ã‚“ã�«ã�¡ã�¯ã�“ã‚“ã�«ã�¡ã�¯ã�“ã‚“ã�«ã�¡ã�¯
        </div>
        <div class="related text-muted">
            ã�“ã‚“ã�«ã�¡ã�¯ã�“ã‚“ã�«ã�¡ã�¯ã�“ã‚“ã�«ã�¡ã�¯ã�“ã‚“ã�«ã�¡ã�¯ã�“ã‚“ã�«ã�¡ã�¯ã�“ã‚“ã�«ã�¡ã�¯ã�“ã‚“ã�«ã�¡ã�¯
        </div>
        <div class="related text-muted">
            ‚“ã�“ã‚“ã�«ã�¡ã�¯ã�“ã‚“ã�«ã�¡ã�¯ã�“ã‚“ã�«ã�¡ã�¯ã�“ã‚“ã�«ã�¡ã�¯ã�“ã‚“ã�«ã�¡ã�¯ã�“ã‚“ã�«ã�¡ã�¯ã�“ã‚“ã�«ã�¡ã�¯
        </div>
        <div class="related text-muted">
            ‚“ã‚“ã�“ã‚“ã�«ã�¡ã�¯ã�“ã‚“ã�«ã�¡ã�¯ã�“ã‚“ã�«ã�¡ã�¯ã�“ã‚“ã�«ã�¡ã�¯ã�“ã‚“ã�«ã�¡ã�¯ã�“ã‚“ã�«ã�¡ã�¯ã�“ã‚“ã�«ã�¡ã�¯
        </div>
    </div>

    {#each data.items as item}
        <File item={item} view={data.view} query={data.query}></File>
    {/each}
    {#if data.items.length > 0}
        <a href={`/${data.item?.folder?.path}?v=random`}>More</a>
    {/if}

{/if}

<style>
    .related {
      overflow: hidden;
      line-height: 14px;
    }
    .edit-this {
        display: flex;
        justify-content: flex-end;
    }
</style>