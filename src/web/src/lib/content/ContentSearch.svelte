<script lang="ts">
	import File from '$lib/content/File.svelte';
	import SearchBox from '$lib/content/SearchBox.svelte';
	import type { Content } from './ContentService';
    import { toQueryString } from "./QueryString";
	export let data: Content;
</script>

<svelte:head>
	<title>Search | BlendedFeelings</title>
</svelte:head>

<div class="mb-3">
    <SearchBox folder={data.item?.folder} query={data.query}></SearchBox>
</div>

{#if data.items}
    {#each data.items as item}
        <File item={item} view={data.view} query={data.query}></File>
    {/each}
    {#if data.nextPage}
        <a href={toQueryString({'p': data.nextPage, 'v': data.view, 'q':data.query})}>More</a>
    {/if}
{/if}