<script lang="ts">
	import type { Content } from './ContentService';
	export let data: Content;

	import { page } from "$app/stores"
    import type {  StepConfig } from 'indexer'
    import { get, writable } from 'svelte/store'
    import { browser } from '$app/environment';

    $: path = $page.url.pathname.substring(1);

    let storedStepsStorageKey = `index,${path}`;
    let storedSteps = browser ? JSON.parse(localStorage.getItem(storedStepsStorageKey)||'{}') : {};
    let steps = writable<{ [name: string]: StepConfig }>({});
    steps.subscribe((value) => { if(browser) localStorage.setItem(storedStepsStorageKey, JSON.stringify(value))})

    async function fetchSteps() {
        const response = await fetch('/b/api/content/steps');
        const fetchedSteps = (await response.json()).steps as { [name: string]: StepConfig };
        let mergedSteps:{ [name: string]: StepConfig } = {};
        for (let stepKey in fetchedSteps) {
            let step = fetchedSteps[stepKey];
            mergedSteps[stepKey] = {...step, ...storedSteps[stepKey]};
        }
        steps.set(mergedSteps);
    };
    
	async function submit() {
        let response = await fetch('/b/api/content/queue',
        { 
            method: "POST", 
            body: JSON.stringify({
                path: path, 
                steps: $steps}) 
        });
    }

    function step(func:(step: StepConfig) => void) {
        for(let step of Object.entries($steps)) {
            func(step[1]);
        }
        steps.set($steps);
    }
</script>

<svelte:head>
	<title>Indexer | BlendedFeelings</title>
</svelte:head>

<div class="indexer">
    <strong>Indexer</strong>
    {#await fetchSteps()}
        <p>Loading...</p>
    {:then}
        <div>
            <table>
                <tr>
                    <td><br/><br/><strong>Step</strong></td>
                    <td>
                        <a href="#top" on:click={() => step(x => x.run = true)}>all</a><br/>
                        <a href="#top" on:click={() => step(x => x.run = false)}>none</a><br/>
                        <strong>Run</strong>
                    </td>
                    <td><a href="#top" on:click={() => step(x => x.force = true)}>all</a><br/>
                        <a href="#top" on:click={() => step(x => x.force = false)}>none</a><br/>
                        <strong>Force</strong>
                    </td>
                    <td></td>
                </tr>
                {#each Object.entries($steps) as [stepKey, step]}
                <tr>
                    <td>{stepKey}</td>
                    <td><input type="checkbox" bind:checked={$steps[stepKey].run} /></td>
                    <td><input type="checkbox" bind:checked={$steps[stepKey].force} /></td>
                    <td>
                    {#if step.options}
                        {#each Object.entries(step.options) as [argKey, arg]}
                        <input bind:value={$steps[stepKey].options[argKey]} placeholder={argKey} />
                        {/each}
                    {/if}
                    </td>
                </tr>
                {/each}
            </table>
            <button on:click={submit}>Submit</button>
        </div>
    {:catch error}
        <p style="color: red">{error.message}</p>
    {/await}
</div>

<style>
	.indexer {
		margin: 1em;
		padding: 1em;
		border: 1px solid #ccc;
	}
</style>