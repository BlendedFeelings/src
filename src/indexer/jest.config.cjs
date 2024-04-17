/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  transform: {},
};
const dotenv = require("dotenv");
console.log(dotenv.config({path:"../.env"}).error);