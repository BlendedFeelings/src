<script lang="ts">
	import type { ContentItem } from "./ContentService";
	export let view:string|null = null;
    export let query:string|null = null;
    export let folder:ContentItem|null = null;
    $: path = folder?.path || "";
</script>

<div class="nav">
    <a href="/{path}" class="item" class:item-selected={view === "latest"}>latest</a>
    <a href="/{path}?v=random" class="item" class:item-selected={view === "random"}>random</a>
    <a href="/{path}?v=explore" class="item" class:item-selected={view === "explore"}>explore</a>
    <a href="/{path}?v=search" class="item" class:item-selected={view === "search"}>search</a>
</div>

<style>
    .nav {
        font-family: monospace;
    }
    .item {
        color: rgb(0, 0, 0);
        margin-right: 5px;
        font-size: 16px;
    }
    .item-selected {
        color: rgb(0, 0, 0);
        font-size: 18px;
        font-weight: bold;
    }
</style>