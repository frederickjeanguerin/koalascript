"use strict";

const chalk = require('chalk');
const readline = require('readline');
const gen = require('./generator');
const runjs = new(require('./runjs'));

function startRepl() {
    let parseOnly = false;
    let compileOnly = false;
    let debug = false;

    console.log(chalk.green("\nKoalang repl\nUse 'exit' to quit\n"));

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: chalk.green('K> ')
    });

    rl.on('line', (command) => {
        execReplCommand(command.trimEnd());
        rl.prompt();
    });

    rl.on('close', () => {
        process.exit(0);
    });

    rl.prompt();

    return;

    function execReplCommand(command) {
        switch (command) {

            case 'exit':
            case '#exit':
                rl.close();
                break;

            case '#d':
            case '#debug':
                debug = !debug;
                console.log(chalk.green('debug') + " is now " + chalk.yellow(debug));
                break;

            case '##':
            case '#p':
            case '#parseOnly':
            case '#parse-only':
                parseOnly = !parseOnly;
                console.log(chalk.green('parseOnly') + " is now " + chalk.yellow(parseOnly));
                break;

            case '###':
            case '#c':
            case '#compileOnly':
            case '#compile-only':
                compileOnly = !compileOnly;
                console.log(chalk.green('compileOnly') + " is now " + chalk.yellow(compileOnly));
                break;

            default:
                // If its an unknown command
                if (/#\S/.test(command.slice(0, 2))) {
                    console.log(chalk.green('Unknown command: ') + command);
                } else {
                    // its a kcode instruction
                    runKCode(command);
                }
        }
    }

    function runKCode(kcode) {
        const genResult = gen(kcode, {
            selfContained: false,
            parseOnly
        });
        if (genResult.hasErrors) {
            // nothing to do, errors have been reported.
        } else if (genResult.needsMoreFeed) {
            // TODO not implemented
            console.error("NEEDS MORE FEED: not implemented...");
        } else if (parseOnly) {
            console.log(genResult.parsing);
        } else if (genResult.jscode === "") {
            // nothing to do, no code to evaluate or show
        } else if (compileOnly) {
            console.log(genResult.jscode);
        } else {
            // run code
            // const {result, error} = runjs.asExprOrStmt(jscode);
            const {
                result,
                error
            } = runjs.run(genResult.jscode);
            if (error)
                console.error(error);
            else if (result !== undefined)
                console.log(result);
        }
    }
}

module.exports = startRepl;

if (typeof require != 'undefined' && require.main == module)
{
    startRepl();
}

