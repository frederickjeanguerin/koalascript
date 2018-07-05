
const muteConsole = {
    error: noop,
    log : noop,
    info : noop,
    warn : noop,
};

function noop(){ }

// IO interface
module.exports = {
    console : muteConsole,
    acceptColors : false,
    writeStdout : noop,
    writeStderr : noop,
    readStdin : noop,
    readFile : noop,
    saveFile : noop,
    restore : noop,
};
