<script lang="ts">	
	import type { PageData } from './$types';
    import SpanComponent from './_span.svelte';
	export let data: PageData;
</script>

<main>
    <h1>Logs</h1>

    {#each data.spans as span}
        <SpanComponent span={span}/>
    {/each}
</main>