<script lang="ts">
	import type { ContentItem } from "./ContentService";
    export let query:string|null;
    export let folder:ContentItem|null|undefined;
    let path = folder?.path ? folder.path : "";
    $: {
        if (path && folder && path != folder?.path)
            path = folder.path || "";
    }
</script>

<form method="get" action={"/" + path + "?v=search"}>
    <input type="hidden" name="v" value="search">
    <input name="q" value={query}><br>
    {#if folder && folder.path}
    <input id="search_in_path" type="radio" bind:group={path} value={folder.path}>
    <label for="search_in_path">in {folder.path}</label> <br/>
    <input id="search_everywhere" type="radio" bind:group={path} value="">
    <label for="search_everywhere">everywhere</label> <br/>
    {/if}
    <input type="submit" value="Search">
</form>