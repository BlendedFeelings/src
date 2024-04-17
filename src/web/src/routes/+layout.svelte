<script lang="ts">
	import '../app.css';
	import Header from '$lib/header/Header.svelte';
	import { navigating } from '$app/stores'
</script>
{#if Boolean($navigating)}
<div class="loading">
	Loading...
</div>
{/if}
<Header></Header>
<slot />

<style>
	.loading {
		position: fixed;
    	z-index: 999;
		background-color: white;
	}
</style>
