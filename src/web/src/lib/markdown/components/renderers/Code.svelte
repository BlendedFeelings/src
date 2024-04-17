<script  lang="ts">
  import Highlight, {LineNumbers} from "svelte-highlight";
  import python from "svelte-highlight/languages/python";
  import java from "svelte-highlight/languages/java";
  import typescript from "svelte-highlight/languages/typescript";
  import javascript from "svelte-highlight/languages/javascript";
  import csharp from "svelte-highlight/languages/csharp";
  import kotlin from "svelte-highlight/languages/kotlin";
  import go from "svelte-highlight/languages/go";
  import sql from "svelte-highlight/languages/sql";
  import "svelte-highlight/styles/github.css";
  export let includePath:string | null | undefined
  export let lang:string | null | undefined
  export let value:string | null | undefined
  let language:any = null
  $: {
    if (lang === "ts" || lang === "typescript") {
      language = typescript
    } else if (lang === "js" || lang === "javascript") {
      language = javascript
    } else if (lang === "py" || lang === "python") {
      language = python
    } else if (lang === "c#" || lang === "csharp") {
      language = csharp;
    } else if (lang === "kotlin") {
      language = kotlin;
    } else if (lang === "go") {
      language = go;
    } else if (lang === "sql") {
      language = sql;
    } else if (lang === "java") {
      language = java;
    } else {
      language = java;
    }
  }
</script>

{#if value && lang}
<div class="code">
  <div class="header">
    {lang}
    {#if includePath}
      <a href={includePath} class="text-normal"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-github" viewBox="0 0 16 16">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
      </svg></a>
    {/if}
  </div>
  <Highlight language={language} code={value}>
  </Highlight>
</div>
{/if}

<style>
  .code {
    margin-top: 3rem;
    background-color: rgb(246, 248, 250);
    font-size: 15px;
  }
  .header {
    padding-top: 6px;
    padding-left: 20px;
    padding-right: 20px;
    display: flex;
    justify-content: space-between;
  }
  :global(.code pre, .code code) {
    background-color: rgb(246, 248, 250);
    padding:0px;
  }
</style>