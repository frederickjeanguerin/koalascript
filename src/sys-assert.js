module.exports = sysAssert

const SysError = require('./sys-error');

class SysAssertionError extends SysError {
    constructor(stackTraceUpToFn = SysAssertionError, template = "Assertion failed!", infos = {}) {
        super(stackTraceUpToFn, template, infos);
    }
};

sysAssert.Error = SysAssertionError;

function sysAssert(condition, template, infos, stackTraceUpToFn = sysAssert)
{
    if(!condition)
    {
        throw new SysAssertionError(stackTraceUpToFn, template, infos)
    }
    return condition;
}

sysAssert.eq = function (expected, given)
{
    sysAssert(expected === given, "Expected {expected} but got {given}", {expected, given}, sysAssert.eq);
}
