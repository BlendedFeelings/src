<script context="module" lang="ts">
	import { signIn, signOut } from "@auth/sveltekit/client"
	import { page } from "$app/stores"

</script>

<script lang="ts">
</script>

<svelte:head>
	<title>BlendedFeelings</title>
	<meta name="description" content="BlendedFeelings" />
</svelte:head>


<main>
	<h1>BlendedFeelings</h1>
  <div class="mt-1">
    {#if $page.data.session}
      You are signed in as <strong>{$page.data.userid}</strong> (GitHub). <a href="#top" on:click={() => signOut()}>Sign out</a>.
    {:else}
      Sign in with <a href="#top" on:click={(e) => signIn("github")}>GitHub</a>.
    {/if}
  </div>

  {#if $page.data.isAdmin}
  <div class="mt-1">
    <a href="/b/admin">Admin</a>
  </div>
  {/if}

</main>
