<script lang="ts">
	import Folder from '$lib/content/Folder.svelte';
	import type { Content } from './ContentService';
	export let data: Content;
</script>

<svelte:head>
	<title>Explore | BlendedFeelings</title>
</svelte:head>

{#if data.items}
    {#each data.items as folder}
        <Folder item={folder} view={null}></Folder>
    {/each}
{/if}
