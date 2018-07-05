const fs = require('fs');
const {readAll} = require('./util-node');
const globalConsole = console;

module.exports = {

    get console() { return globalConsole; },
    get acceptColors() { return process.stdout.isTTY; },

    writeStdout(message)
    {
        process.stdout.write(message);
    },

    writeStderr(message)
    {
        process.stderr.write(message);
    },

    async readStdin()
    {
        return await readAll(process.stdin);
    },

    /**
     * @param  {string} fileName
     * @return {string} File content
     */
    readFile(fileName)
    {
        return fs.readFileSync(fileName, {encoding:"utf8"});
    },

    /**
     * @param  {string} fileName
     * @param  {string} content
     */
    saveFile(fileName, content)
    {
        fs.writeFileSync(fileName, content);
    },

    restore : () => {},
};
