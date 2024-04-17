<script lang="ts">
	import File from '$lib/content/File.svelte';
	import type { Content } from './ContentService';
    import { toQueryString } from "./QueryString";
	export let data: Content;
</script>

<svelte:head>
	<title>Random | BlendedFeelings</title>
</svelte:head>

{#if data.items}
    {#each data.items as item}
        <File item={item} view={data.view} query={data.query}></File>
    {/each}
    <a href={toQueryString({'v':data.view})}>More</a>
{/if}