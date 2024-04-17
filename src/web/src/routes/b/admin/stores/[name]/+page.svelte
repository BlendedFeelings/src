<script lang="ts">	
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<main>
	<h1>Store</h1>
	{data.storeName}

	<form method="GET">
		<label>
			Key
			<input name="key" value="{data.key || ''}">
		</label>
		<button>Get</button>
	</form>

	<div>
		{#if data.value}
	<pre><code>{JSON.stringify(data.value, null, 4)}</code></pre>
		{:else}
			No value
		{/if}
	</div>
</main>