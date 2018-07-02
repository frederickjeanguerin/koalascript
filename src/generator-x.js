"use strict";

const klex = require('./klex');
const gen = require('./generator');
const Logger = require('./logger');
const helloWorld = (require('./samples')).kcode.helloWorld;

klex.lexAll(helloWorld).forEach( token => console.log(token));

console.log("\nGÉNÉRATION:");
console.log(gen(Logger.default, helloWorld));

gen(Logger.default.restore(), "$\n$\n"); // K parse Error

gen(Logger.default.restore(), `
    # A multiline program with a js syntax error
    $ 1 + ) +
    $ 2 + ) +
    # somme comment after
`); // JS parse Error x2
