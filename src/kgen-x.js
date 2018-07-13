"use strict";

// const klex = require('./klex');
const kgen = require('./kgen');
const Logger = require('./logger');
const helloWorld = (require('./samples')).kcode.helloWorld;
const io = require('./io-node');
const log = new Logger({io});

// klex.lexAll(helloWorld).forEach( token => console.log(token));

let {jscode, jsonMap} = kgen(log, helloWorld);
console.log(jscode);
console.log(jsonMap);

({jscode, jsonMap} = kgen(log, "$"));
console.log(jscode);
console.log(jsonMap);
console.log(log.errors);


