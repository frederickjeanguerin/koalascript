const format = require('string-format');
const pathParse = require('path-parse');

class SysError extends Error
{
    /**
     * Arguments can be mixed up and all are optionals.
     * @param  {Function} stackTraceUpToFn
     * @param  {String} template
     * @param  {Object} infos
     */
    constructor(stackTraceUpToFn, template, infos)
    {
        stackTraceUpToFn = SysError;
        template = "";
        infos = {};

        for(const arg of arguments){
            if(typeof arg === 'string') template = arg
            else if(typeof arg === 'function') stackTraceUpToFn = arg
            else if(typeof arg === 'object' && arg.__proto__.constructor === Object) infos = arg;
            else throw new TypeError("Invalid arg: " + arg)
        }

        super(format(template, infos));
        Object.assign(this, {template, infos}, infos);
        if(Error.captureStackTrace) Error.captureStackTrace(this, stackTraceUpToFn);
    }

    filteredStack(traceDir = pathParse(__dirname).dir) {
        return this.stack.split('\n').filter(trace => trace.includes(traceDir)).join('\n')
    }

    log({logFn = console.error, withArgs = true, withStack = true, traceDir = undefined} = {}) {
        logFn(this.__proto__.constructor.name, this.message ? ": " + this.message : undefined)
        if(withArgs && Object.keys(this.infos).length) logFn(this.infos)
        if(withStack) logFn(this.filteredStack(traceDir))
    }

};

module.exports = SysError;
