/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types


declare interface Window {
	playVideo: (div:HTMLDivElement) => void;
}

declare namespace App {
	interface Locals {
		userid: string|null|undefined;
		isAdmin: boolean|null|undefined;
		services: import("$lib/webServices").WebServices;
	}
	interface PageData {
		userid: string|null|undefined;
		isAdmin: boolean|null|undefined;
	}
	// interface Platform {}

	// interface Session {}

	// interface Stuff {}
}