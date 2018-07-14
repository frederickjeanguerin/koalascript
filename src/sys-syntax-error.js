const SysError = require('./sys-error');

class SysSyntaxError extends SysError {
    constructor(syntaxMessage, sourceName, line, column) {
        const position = {line, column}
        super(SysSyntaxError,
            "{sourceName} ({line}:{column}): {syntaxMessage}",
            {syntaxMessage, sourceName, line, column, position});
    }
};

module.exports = SysSyntaxError;
