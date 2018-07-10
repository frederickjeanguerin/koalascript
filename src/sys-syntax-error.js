const SysError = require('./sys-error');

class SysSyntaxError extends SysError {
    constructor(syntaxMessage, sourceName, line, column) {
        super(SysSyntaxError,
            "{sourceName} ({line}:{column}): {syntaxMessage}",
            {syntaxMessage, sourceName, line, column});
    }
};

module.exports = SysSyntaxError;
