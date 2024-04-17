<script lang="ts">
  import type { Content } from '../processor';
  import { supressWarnings } from './supress-warnings';
  import { renderers } from './renderers';
  export let type:string|null|undefined = undefined;
  export let children: Content[]|null|undefined = undefined;
  supressWarnings();
</script>
{#if type && type in renderers}
  <svelte:component this={renderers[type]} {children} {...$$restProps}>
    {#if children}
      <svelte:self {children}/>
    {/if}
  </svelte:component>
{:else}
  {#if children}
    {#each children as token}
        <svelte:self {...token}/>
    {/each}
  {/if}
{/if}


