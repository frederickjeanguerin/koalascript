"use strict";
const chalk = require('chalk');
const Runjs = require('./runjs');
const runjs = new Runjs({timeout: 100});

const jscodes = [
    "10",
    "undefined",
    "",
    "const max = 100",
    "max",
    // "(\n3\n+\n3\n)",

    // syntax error
    "  (",
    // "(\n3\n+\n3\n",
    "return 3",
    "const a =",

    // run-time error
    "undefined_identifier",     // not an error, but should be.
    "throw 'error'",
    "throw new Error('My error!')",

    // timeout
    "function fib(n) { return n < 1 ? 1 : fib(n-1) + fib(n-2); };fib",
    "fib(5)",
    "fib(30)",  // timeout overflow

    "console.log('\\n********************************************************\\n')",
    "console.chapeau('\\n********************************************************\\n')",
];

for(const jscode of jscodes)
{
    const {result, error} = runjs.run(jscode);
    const query = `"${chalk.blue(jscode+"")}" => `;
    if(error)
    {
        console.error(query + error);
    }
    else
    {
        console.log(query, result);
    }
}
