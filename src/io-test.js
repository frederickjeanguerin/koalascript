module.exports = function( {fakeStdin = "", fakeFiles = [], acceptColors = false} = {}) {

    /** NB: 'fake' object will contains the errors logged for:
     *  - log = console.log
     *  - error = console.error
     *  - warn = console.warn
     *  - info = console.info
     *  - stdout
     *  - stdin
     */
    let _fake = {}, _fakeFs = new Map();

    restore();

    const mockConsole = {};

    for(const fnName of ['error', 'log', 'info', 'warn'])
    {
        mockConsole[fnName] = fakeLog.bind(null, fnName, "\n");
    }

    function restore() {
        _fake = {};
        _fakeFs = new Map(fakeFiles);
    }

    function fakeLog(channel, eol, ...messages){
        if(_fake[channel] === undefined)
            _fake[channel] = "";
        _fake[channel] += messages.join(' ') + eol;
    }

    return {

        get fake() { return _fake; },
        get fakeFs() { return _fakeFs; },
        get hasNewFiles() { return _fakeFs.size - fakeFiles.length > 0; },

        get console() { return mockConsole; },
        get acceptColors() { return acceptColors; },

        restore,

        writeStdout : fakeLog.bind(null, 'stdout', ''),

        writeStderr : fakeLog.bind(null, 'stderr', ''),

        readStdin()
        {
            return fakeStdin;
        },

        readFile(fileName)
        {
            const content = _fakeFs.get(fileName);
            if(content === undefined)
                throw Error('[Fake FS] File not found: ' + fileName);
            return content;
        },

        saveFile(fileName, content)
        {
            _fakeFs.set(fileName, content);
        },

    };
};
