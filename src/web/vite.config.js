import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		include: ['../indexer/node_modules/xml2js/**/*'],
	  },
	build: {
		commonjsOptions: {
		}
	},
	server: {
		port: 3006,
	},
});

import * as dotenv from 'dotenv';
console.log(dotenv.config({path:"../.env"}).error);