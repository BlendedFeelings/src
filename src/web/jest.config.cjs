/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'node',
  transform: {

  },
};
const dotenv = require("dotenv");
console.log(dotenv.config({path:"../.env"}).error);