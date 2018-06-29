"use strict";

const
    nearley = require("nearley"),

    // To gain access to the token type
    Token = require("./token"),     // eslint-disable-line no-unused-vars
    grammar = require("./_grammar"),
    Logger = require("./logger"),

    // Create a Parser object from grammar.
    parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar)),
    init_state = parser.save(),     // Save parser initial state for restorations
    tt = parser.lexer.tokenTypes,   // Short naming for Token types

    ____end_const = undefined;

// Exported constants associated with the generator
gen.lexer = parser.lexer;

/**
 * Generates Javascript code for the given kcode.
 * This code is expected to be selfContained by default,
 * wich means that it should be complete by itself.
 * If more code might come in later on the next call, set selfContained to false,
 * for example with a REPL. In this case, if the code is incomplete,
 * it will return NEEDS_MORE instead of generating an ERROR.
 * If the code parses to nothing, "" is returned.
 */
function gen(               /* istanbul ignore next: type hint */
    log = new Logger,       /* istanbul ignore next: type hint */
    kcode = "",
    { selfContained = true, parseOnly = false } = {})
{
    let jscode;
    const parsing = parse(log, kcode, {selfContained});

    if( parsing != undefined && !(parseOnly || log.hasErrors) ) {
        jscode = transpile(parsing);
    }

    return {parsing, jscode};
}


function parse(                     /* istanbul ignore next: type hint */
    log = new Logger(),             /* istanbul ignore next: type hint */
    kcode = "",
    {selfContained = true}={})
{
    void selfContained; // unused for now
    let parsing;
    main : {
        // Parse the code from parser
        try
        {
            parser.feed(kcode);
        }
        catch(err)  // Unexpected token
        {
            if(!err.token) throw err;
            log.error("Unexpected token", err.token.getMessage(kcode));
            break main;
        }

        // Get all possible parse trees
        const parsings = parser.results;

        // We assume parsings array contains at least 1 parsing.
        // because even if there is nothing to parse, an empty parse tree will be returned.
        console.assert(parsings.length >= 0, parsings);

        /* istanbul ignore if : grammar should not be ambiguous */
        // If many parsings, the grammar is ambiguous
        // Output some debug info before continuing the process.
        if(parsings.length > 1)
        {
            let warning = ["Warning: Ambiguous grammar\n"];
            for(const [parsing, i] of parsings.entries())
            {
                warning.push(i);
                warning.push(":");
                warning.push(parsing);
                warning.push("\n");
            }
            warning.push(">>> Continuing with only the first one.\n");
            log.warn(warning);
        }

        // We concentrate on the first parsing only.
        // Actually this parsing contains a sequence of statements.
        parsing = parsings[0];

        // TODO The following doesn't work for a partial parsing
        // * We need to check that de last token produced by the lexer has been put in the parse tree
        // * However, with the current grammar, no code can be left out

        // const nothingParsed = stmts.length === 0;
        // const someTokensFetched = parser.current > 0;
        // if( nothingParsed && someTokensFetched && selfContained)
        // {
        //     // In self contained code, all tokens should be parsed in the parse tree
        //     result.reportError(chalk.red("Error: ") + "Unexpected end of code.");
        // }
    }

    // Prepare parser for the next code generation
    if ( log.hasErrors || parsing != undefined ) parser.restore(init_state);
    return parsing;
}


/**
 * @param  {Token[]} stmts
 * @returns {string} -- jscode
 */
function transpile(stmts)
{
    let jscode = "";
    for ( let stmt of stmts ) {

        const token = stmt;

        switch(token.type) {

            case tt.js_line:
                // TODO validate inline js code before insertion
                jscode += (jscode ? ";" : "") + token.info;
                break;

            /* istanbul ignore next */
            default:
                // *This is a developper error, not a user error
                throw Error(`Unrecognized token type '${token.type}'`);
        }
    }
    return jscode;
}

module.exports = gen;
