const globalConsole = console;

function noop(){};

module.exports = {

    get console() { return globalConsole; },
    get acceptColors() { return true; },

    writeStdout(message)
    {
        alert(message);
    },

    writeStderr(message)
    {
        alert(message);
    },

    readStdin()
    {
        return prompt("Enter stdin input: ", "");
    },

    readFile : noop,
    saveFile : noop,
    restore : noop,
};
