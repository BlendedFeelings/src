<script lang="ts">
	import Navigation from '$lib/content/Navigation.svelte';
	import Breadcrumbs from '$lib/content/Breadcrumbs.svelte';
	import type { Content } from './ContentService';
	import ContentIndexer from './ContentIndexer.svelte';
	import ContentExplore from './ContentExplore.svelte';
	import ContentSearch from './ContentSearch.svelte';
	import ContentFile from './ContentFile.svelte';
	import ContentLatest from './ContentLatest.svelte';
	import ContentRandom from './ContentRandom.svelte';
	export let data: Content;
</script>

<div>
	<div class="mb-3">
		{#if data.item?.type === 'file'}
			<Navigation></Navigation>
		{:else}
			<Navigation folder={data.item?.folder} view={data.view} query={data.query}></Navigation>
			<Breadcrumbs folder={data.item?.folder} view={data.view} query={data.query}></Breadcrumbs>
		{/if}
	</div>

	{#if data.view === 'indexer'}
		<ContentIndexer data={data}></ContentIndexer>
	{/if}

	{#if data.view === 'explore'}
		<ContentExplore data={data}></ContentExplore>
	{/if}

	{#if data.view === 'search'}
		<ContentSearch data={data}></ContentSearch>
	{/if}

	{#if data.view === 'latest'}
		<ContentLatest data={data}></ContentLatest>
	{/if}

	{#if data.view === 'random'}
		<ContentRandom data={data}></ContentRandom>
	{/if}

	{#if data.item?.type === 'file'}
		<ContentFile data={data}></ContentFile>
	{/if}
	
</div>

