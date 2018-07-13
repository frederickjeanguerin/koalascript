module.exports = gen;

const
    Logger = require("./logger"),
    kparse = require('./kparse'),
    emit = require('./emit'),

    ____end_const = undefined;

/**
 * Generates Javascript code for the given kcode.
 * This code is expected to be selfContained by default,
 * wich means that it should be complete by itself.
 * If more code might come in later on the next call, set selfContained to false,
 * for example with a REPL. In this case, if the code is incomplete,
 * it will return nothing and no errors.
 */

function gen(               /* istanbul ignore next: type hint */
    log = new Logger,       /* istanbul ignore next: type hint */
    kcode = "",
    { selfContained = true, parseOnly = false, sourceName = "default" } = {})
{
    let jscode, jsonMap, errors;
    const parsing = kparse(log, kcode, {selfContained});

    if( parsing != undefined && !(parseOnly || log.hasErrors) ) {
        ({jscode, jsonMap, errors} = emit(parsing, kcode, sourceName));
        for(const error of errors) {
            log.error(error.message);
        }
    }


    return {parsing, jscode, jsonMap};
}

