"use strict";
const nearley = require("nearley");
const grammar = require("./_grammar.js");

// Create a Parser object from our grammar.
const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

const code = (require('./samples')).kcode.helloWorld;

// Parse something!
parser.feed(code);

// parser.results is an array of possible parsings.
console.log(parser.results);
