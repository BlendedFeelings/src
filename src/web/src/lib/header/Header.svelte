<script lang="ts">
    import { page } from '$app/stores';
</script>

<header>
    <div class="navigation">
        <div class="logo">
            <a href="/">b</a>
        </div>
        <div class="menu">
            <a href="/b" class="sign-in text-normal">
                {#if $page.data.userid}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-emoji-smile-upside-down" viewBox="0 0 16 16">
                    <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1m0-1a8 8 0 1 1 0 16A8 8 0 0 1 8 0"/>
                    <path d="M4.285 6.433a.5.5 0 0 0 .683-.183A3.5 3.5 0 0 1 8 4.5c1.295 0 2.426.703 3.032 1.75a.5.5 0 0 0 .866-.5A4.5 4.5 0 0 0 8 3.5a4.5 4.5 0 0 0-3.898 2.25.5.5 0 0 0 .183.683M7 9.5C7 8.672 6.552 8 6 8s-1 .672-1 1.5.448 1.5 1 1.5 1-.672 1-1.5m4 0c0-.828-.448-1.5-1-1.5s-1 .672-1 1.5.448 1.5 1 1.5 1-.672 1-1.5"/>
                </svg>
                {:else}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-emoji-smile" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                    <path d="M4.285 9.567a.5.5 0 0 1 .683.183A3.5 3.5 0 0 0 8 11.5a3.5 3.5 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683M7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5m4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5"/>
                </svg>
                {/if}
            </a>
        </div>
    </div>
</header>


<style>
    header {
        max-width: 1024px;
        margin: 0 auto;
        padding: 1rem;
        margin-bottom: 1rem;
    }

    .navigation {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .logo {
        padding: 5px;
    }

    .logo a {
        font-weight: bold;
        font-family: monospace;
        font-size: 20px;
    }

    .logo a, .logo a:visited, .logo a:active, .logo a:hover  {
        color: rgb(33, 37, 41);
    }

    .menu {
        display: flex;
        padding: 5px;
        padding-top: 8px;
    }
</style>