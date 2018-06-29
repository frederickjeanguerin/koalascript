"use strict";
const
    klexer = require('./klex');

// Simple manual test
const code = (require('./samples')).kcode.helloWorld;

for(let token of klexer.lexAll(code))
{
    console.log(token);
}

// Entering repl mode
klexer.lexer.setDebugEnabled(true);

const readline = require('readline');

console.log("\nK lexer repl.\nUse 'exit' to quit.\n");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Klex> '
});

rl.on('line', (kcode) => {
    switch(kcode) {
        case 'exit':
        case '#exit':
            rl.close();
            break;
        default:
            for(let token of klexer.lexAll(kcode))
            {
                console.log(token);
            }
            rl.prompt();
    }
});

rl.on('close', () => {
    process.exit(0);
});

rl.prompt();

