"use strict";

const {VM, VMScript} = require('vm2'); // https://github.com/patriksimek/vm2
const chalk = require('chalk');

// The global sandbox contains all possible global definitions useful to run any JS program.
const globalSandBox = (()=>{
    const __global__ =
        typeof global !== 'undefined' ? global
            : typeof window !== 'undefined' ? window
                : {};
    // strangely enough, the global object doesnt include require and console, so we add them to the sandbox.
    const gSandbox = {...__global__, require, console};
    // The vm doesnt like a proprety named global, so we remove it.
    // That is because it will add its own "global" property.
    delete gSandbox.global;
    return gSandbox;
})();

class Runjs {
    /**
     * The sandbox is everything by default.
     */
    constructor({timeout = 1000, sandbox = globalSandBox} = {}) {
        this.config = {};
        this.reset({timeout, sandbox});
    }

    /**
     * Resets the VM, clearing defined symbols.
     * @param {Object} config Modifications to base configuration.
     */
    reset(config = {})
    {
        this.config = Object.assign(this.config, config);
        this.vm = new VM(this.config);
    }

    /**
     * Returns true if jscode is a valid expression.
     * If the code has a syntax error or is not an expression, returns false.
     * @param  {string} jscode
     * @returns {boolean}
     */
    static isValidExpr(jscode)
    {
        try
        {
            new VMScript("(" + jscode + ")").compile();
            return true;
        }
        catch (e)
        {
            return false;
        }
    }

    /**
     * Returns a SyntaxError if there is a syntax error, otherwise undefined.
     * @param  {string} jscode
     * @returns {?SyntaxError}
     */
    static checkSyntax(jscode)
    {
        try
        {
            new VMScript(jscode).compile();
            return undefined;
        }
        catch (e)
        {
            /* istanbul ignore else */
            if(e instanceof SyntaxError) return e;
            // Other errors types are not welcome here and may denote some internal problem.
            else throw e;
        }
    }

    /**
     * Format a syntax error into a colorful message.
     * TODO this function and the next are not used now and should be moved to the Logger.
     * @param  {SyntaxError} syntaxError
     * @return {string}
     */
    static formatSyntaxError(syntaxError)
    {
        if (! (syntaxError instanceof SyntaxError))
            throw new TypeError("Argument should be a SyntaxError: " + syntaxError);
        const [__, line, code1, code2, message] = /vm\.js:(\d+)\n(.+)\n(.+)\n\n(.+)/m.exec(syntaxError.stack);
        return Runjs.formatErrorDescription(message) + ", at line: " + line + `\n  ${code1}\n  ${code2}\n`;
    }

    /**
     * TODO see previous.
     * @param  {string} msg
     * @returns {string}
     * @private
     */
    static formatErrorDescription(errorDescr)
    {
        const [__, errorType, message] = /([^:]+): (.+)/.exec(errorDescr);
        return chalk.red(errorType + ": ") + chalk.yellow(message);
    }

    /**
     * Runs the given JS code as an expression.
     * @param  {string} jscode
     * @return {{result, error:Error}}
     */
    run(jscode)
    {
        let result,
            error = Runjs.checkSyntax(jscode);

        if(!error)
        {
            try
            {
                result = this.vm.run(jscode);
            }
            catch (e)
            {
                error = e;
            }
        }
        return {result, error};
    }
};

Runjs.globalSandBox = globalSandBox;

module.exports = Runjs;
