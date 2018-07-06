"use strict";

const klex = require('./klex');
const gen = require('./generator');
const Logger = require('./logger');
const helloWorld = (require('./samples')).kcode.helloWorld;
const io = require('./io-node');
const log = new Logger({io});

klex.lexAll(helloWorld).forEach( token => console.log(token));

console.log("\nGÉNÉRATION:");
const {jscode, sourceMap} = gen(log, helloWorld);
console.log(jscode);
console.log(sourceMap);

// gen(log.restore(), "$\n$\n"); // K parse Error

// gen(log.restore(), `
//     # A multiline program with a js syntax error
//     $ 1 + ) +
//     $ 2 + ) +
//     # somme comment after
// `); // JS parse Error x2
