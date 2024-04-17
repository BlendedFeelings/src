<script  lang="ts">
	import type { Content } from 'mdast-util-from-markdown/lib';
  import Renderer from '../Renderer.svelte'
  export let depth:number
  export let value:string | null | undefined
  export let children:Content[] | null | undefined
  export let id:string|null|undefined
</script>
{#if depth === 1}
  <h1 id={id}><Renderer {children}></Renderer></h1>
{:else if depth === 2}
  <h2 id={id}><Renderer {children}></Renderer></h2>
{:else if depth === 3}
  <h3 id={id}><Renderer {children}></Renderer></h3>
{:else if depth === 4}
  <h4 id={id}><Renderer {children}></Renderer></h4>
{:else if depth === 5}
  <h5 id={id}><Renderer {children}></Renderer></h5>
{:else if depth === 6}
  <h6 id={id}><Renderer {children}></Renderer></h6>
{:else}
  {value}
{/if}
