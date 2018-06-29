"use strict";

const klex = require('./klex');
const gen = require('./generator');
const Logger = require('./logger');
const helloWorld = (require('./samples')).kcode.helloWorld;

klex.lexAll(helloWorld).forEach( token => console.log(token));

console.log("\nGÉNÉRATION:");
console.log(gen(Logger.default, helloWorld).jscode);

gen(Logger.default, "$"); // Error

