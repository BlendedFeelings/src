import * as dotenv from 'dotenv';
console.log(dotenv.config({path:"../.env"}).error);
await import('./build/index.js');
