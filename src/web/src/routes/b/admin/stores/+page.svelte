<script lang="ts">	
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<main>
	<h1>Stores</h1>

	{#each data.stores as store}
		<div><a href="stores/{store}">{store}</a></div>
	{/each}
</main>