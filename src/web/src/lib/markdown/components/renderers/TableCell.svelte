<script lang="ts">
  export let header:string
  export let align:"left" | "center" | "right" | "justify" | "char" | null | undefined
</script>

{#if header}
  <th {align}><slot></slot></th>
{:else}
  <td {align}><slot></slot></td>
{/if}
