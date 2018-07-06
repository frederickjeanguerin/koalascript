"use strict";

const
    Token = require("./token"),     // eslint-disable-line no-unused-vars
    Logger = require("./logger"),
    kparse = require('./kparse'),
    tt = require('./token-types'),

    acorn = require("acorn"),
    // Babel parser and generator
    // {parse : jsparse} = require("@babel/parser"),
    // {default: jsgenerate} = require("babel-generator"),
    escodegen = require('escodegen'),
    babelCodeFrame = require("babel-code-frame"),

    ____end_const = undefined;

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
    { selfContained = true, parseOnly = false, sourceName = "default" } = {})
{
    let jscode, sourceMap;
    const parsing = kparse(log, kcode, {selfContained});

    if( parsing != undefined && !(parseOnly || log.hasErrors) ) {
        ({jscode, sourceMap} = emit(log, parsing, kcode, sourceName));
    }

    return {parsing, jscode, sourceMap};
}

/**
 * @returns {{jscode:string, sourceMap}} -- jscode and sourceMap
 */
function emit(              /* istanbul ignore next: type hint */
    log = new Logger(),     /* istanbul ignore next: type hint */
    stmts = [new Token()],  /* istanbul ignore next: type hint */
    kcode = "",             /* istanbul ignore next: type hint */
    sourceName = "",
){
    const body = [];
    const sources = {};
    for ( let stmt of stmts ) {

        const token = stmt;

        switch(token.type) {

            case tt.js_line:
                js_line(token); break;

            /* istanbul ignore next */
            default:
                // *This is a developper error, not a user error
                throw Error(`Unrecognized token type '${token.type}'`);
        }
    }

    const ast = {type:"Program", body};
    const {code : jscode, map : sourceMap} = escodegen.generate(ast, {
        sourceMap: sourceName, sourceContent: kcode, sourceMapWithCode: true });
    return {jscode, sourceMap: JSON.parse(sourceMap.toString())};

    // ------ Functions -----------

    function js_line(token = new Token())
    {
        // We add lines before and indent the js code to produce good line and column numbers when parsing
        const source = "\n".repeat(token.line - 1) + " ".repeat(token.col) + token.text.slice(1);
        sources[sourceName] = kcode;
        try {
            const ast = jsparse(source, sourceName);
            body.push(...ast.body);
        } catch (err) {
            // syntax error
            const {loc, message } = err;
            log.error(message, "\n" + babelCodeFrame(kcode, loc.line, loc.column + 1));
        }
    }
}

function jsparse (jscode, sourceFile) {
    return acorn.parse(jscode, {
        ecmaVersion: 2018,
        sourceType: "script",
        locations:true,
        sourceFile,
    });
}

module.exports = gen;
