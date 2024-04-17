<script lang="ts">
  export let url:string | null | undefined
</script>

<a href={url}><slot></slot></a>
