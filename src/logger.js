const fs = require('fs');
const chalk = require('chalk');

const {readAll} = require('./util');
const globalConsole = console;

class Logger {

    constructor ({
        // Override the followings to make the logger work with whatever streams it wants.
        stdin = process.stdin,  // Pass a string in here to make stdin read from there.
        stderr = process.stderr,
        stdout = process.stdout,
        console = globalConsole,

        // If this is an Array, file content will come from these to build a fake FS.
        // e.g. [['file1.k', 'program content 1'], ['file2.k', 'program content 2']]
        fakeFiles = false,

        options : {
            // In quiet mode, info messages are not reported.
            quiet = false,
            // In debug mode, debug messages are reported, and stack traces are reported for exceptions.
            // Mode is on if debug !== null.
            // Only messages including the debug string are reported.
            debug = null,
            // In mute mode, no output is produced (collect data only) and no files are written (fake FS is used)
            // Since most logger are created for testing, this options is on by default.
            mute = true,
        } = {},
    } = {}) {

        this.stdin = stdin;
        this.isStdinConsumed = false;
        this.stderr = stderr;
        this.stdout = stdout;
        this.console = console;

        this.useFakeFiles = !!fakeFiles;
        this.fakeFiles = fakeFiles || [];
        this.fakeFs = new Map(fakeFiles || []);

        this.options = {quiet, debug, mute};

        this.errors = [];
        this.warnings = [];
        this.infos = [];
        this.debugs = [];
        this.results = [];
    }
    /**
     * Clear all logs.
     * @return {Logger} itself
     */
    restore() {
        this.errors.length = 0;
        this.warnings.length = 0;
        this.infos.length = 0;
        this.debugs.length = 0;
        this.results.length = 0;
        this.fakeFs = new Map(this.fakeFiles || []);
        this.isStdinConsumed = false;
        return this;
    }

    report(reportFn, colorFn, subject, ...details) {
        if (this.options.mute) return;

        // Get rid of exception stacktrace if not in debug mode
        if(!this.isDebug) {
            for(const [i, detail] of details.entries()){
                if(detail instanceof Error) {
                    details[i] = (detail+"").split("\n")[0];
                }
            }
        }

        // If on terminal, output colorful messages (with the console)
        if(this.stdout.isTTY){
            // First, color all odd detail if its a string.
            for(const [i, detail] of details.entries()){
                if(i % 2 === 1 && typeof detail === 'string')
                    details[i] = chalk.yellow(detail);
            }
            reportFn(colorFn(subject), ...details);
        }

        // Otherwise output strait messages on stderr
        else {
            this.stderr.write( [subject, ...details].join(' ') + "\n");
        }
    }

    info(subject, ...details)
    {
        if(!this.options.quiet) {
            this.infos.push([...arguments].join(' '));
            this.report(this.console.info, chalk.green, subject, ...details);
        }
    }

    debug(subject, ...details)
    {
        if(this.isDebug && subject.includes(this.options.debug)) {
            this.debugs.push([...arguments].join(' '));
            this.report(this.console.log, chalk.cyan, "[Debug] " + subject + ":", ...details);
        }
    }

    warn(...messages)
    {
        this.warnings.push(messages.join(' '));
        this.report(this.console.warn, chalk.yellow, "Warning:", ...messages);
    }

    error(...messages)
    {
        this.errors.push(messages.join(' '));
        this.report(this.console.error, chalk.red, "Error:", ...messages);
    }

    get isDebug() { return this.options.debug !== null; }
    get hasErrors() { return this.errors.length > 0; }
    get hasSomeLogs() {
        return this.errors.length + this.warnings.length + this.results.length
            + (this.fakeFs.size - this.fakeFiles) > 0; }

    /**
     * Use this method to report any final compilation result on stdio.
     * @param {any} aResult
     */
    result( aResult )
    {
        if( this.errors.length )
        {
            this.warn("Could not output result because there are errors:\n", aResult);
            return;
        }

        this.results.push(aResult);
        if(this.options.mute) return;

        if( this.stdout.isTTY )
        {
            if(typeof aResult === 'string')
                aResult = chalk.blue(aResult);
            this.console.log(aResult);
        }

        else
        {
            // If not the first result, add a newline before
            if (this.results.lenght) this.stdout.write("\n");
            this.stdout.write(aResult);
        }
    }
    /**
     * Override previous options with new ones
     * @param  {Object<string, any>} options={}
     * @return {Logger} itself
     */
    reconfig(options = {})
    {
        this.options = {...this.options, ...options};
        return this;
    }

    /**
     * @return {string}
     */
    async readStdin()
    {
        if(this.isStdinConsumed){
            throw new Error("Cant read stdin twice!");
        }
        const stdinContent =
            (typeof this.stdin === 'string') ?
                this.stdin :
                await readAll(this.stdin);
        this.isStdinConsumed = true;;
        return stdinContent;
    }

    /**
     * @param  {string} fileName
     * @return {string} File content
     */
    readFile(fileName)
    {
        return this.useFakeFiles ? check(this.fakeFs.get(fileName)) : fs.readFileSync(fileName, {encoding:"utf8"});

        // To mimick a true FS, we throw an error when file not found.
        function check(data) {
            if(data == undefined) throw new Error('[Fake FS] File not found: ' + fileName);
            return data;
        }
    }
    /**
     * @param  {string} fileName
     * @param  {string} content
     */
    saveFile(fileName, content)
    {
        if (this.options.mute)
        {
            this.fakeFs.set(fileName, content);
        }
        else
        {
            fs.writeFileSync(fileName, content);
        }
    }
};

Logger.default = new Logger({options:{mute:false}});

module.exports = Logger;
