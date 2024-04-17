<script lang="ts">
  import Renderer from './Renderer.svelte';
  import type { Content } from '../processor';
  export let children: Content[]|null|undefined
</script>

{#if children}
<Renderer {children} />
{/if}
