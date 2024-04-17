<script lang="ts">
	import Content from '$lib/content/Content.svelte';
	import type { PageData, ActionData } from './$types';
	import { loremIpsum  } from "lorem-ipsum";
	export let data: PageData;
</script>
<svelte:head>
	<title>BlendedFeelings</title>
	<meta name="description" content="{loremIpsum()}">
</svelte:head>
<main>
	<Content data={data}></Content>
</main>
