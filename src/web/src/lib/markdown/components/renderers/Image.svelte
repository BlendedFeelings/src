<script lang="ts">
  export let href:string | null | undefined
  export let title:string | null | undefined
  export let value:string | null | undefined
</script>

<img src={href} {title} alt={value}>
