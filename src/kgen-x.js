"use strict";

// const klex = require('./klex');
const kgen = require('./kgen');
const helloWorld = (require('./samples')).kcode.helloWorld;

// klex.lexAll(helloWorld).forEach( token => console.log(token));

let {parsing, jscode, jsonSourceMap, errors} = kgen(helloWorld);
console.log(parsing);
console.log(jscode);
console.log(jsonSourceMap);
console.assert(!errors.lenght);

({jscode, jsonSourceMap, errors} = kgen("$"));
console.assert(!jscode, "!jscode");
console.assert(!jsonSourceMap, "!jsonSourceMap");
console.assert(errors.length === 1, "Only one error");
console.log(errors[0].toString());
