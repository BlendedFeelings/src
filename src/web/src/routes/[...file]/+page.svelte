<script lang="ts">
	import Content from '$lib/content/Content.svelte';
	import type { PageData, ActionData } from './$types';
	export let data: PageData;
</script>

<main>
	<Content data={data}></Content>
</main>
