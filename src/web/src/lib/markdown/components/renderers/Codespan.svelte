<script  lang="ts">
  export let value:string | null | undefined
</script>

<code>{value?.replace(/`/g, '')}</code>
