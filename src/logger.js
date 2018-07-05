const IoMute = require('./io-mute');
const chalk = require('chalk');

module.exports = class Logger {

    constructor (
        {
            // In quiet mode, info messages are not reported.
            quiet = false,
            // In debug mode, debug messages are reported, and stack traces are reported for exceptions.
            // Mode is on if debug !== null.
            // Only subject messages including the debug string are reported.
            debug = null,
            // io object used. By default al io are muted (for testing purpose).
            io = IoMute,
        } = {},
    ) {

        this.io = io;
        this.options = {quiet, debug};

        this.errors = [];
        this.warnings = [];
        this.infos = [];
        this.debugs = [];
        this.results = [];
    }

    get isDebug() { return this.options.debug !== null; }
    get hasErrors() { return this.errors.length > 0; }
    get hasSomeLogs() {
        return this.errors.length + this.warnings.length + this.results.length > 0;
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
        this.io.restore();
        return this;
    }

    report(reportFn, colorFn, subject, ...details) {

        // Get rid of exception stacktrace if not in debug mode
        if(!this.isDebug) {
            for(const [i, detail] of details.entries()){
                if(detail instanceof Error) {
                    details[i] = (detail+"").split("\n")[0];
                }
            }
        }

        // If on terminal, output colorful messages (with the console)
        if(this.io.acceptColors){
            // First, color all odd detail if its a string.
            for(const [i, detail] of details.entries()){
                if(i % 2 === 1 && typeof detail === 'string') {
                    details[i] = chalk.yellow(detail);
                }
            }
            reportFn(colorFn(subject), ...details);
        }

        // Otherwise output strait messages on stderr
        else {
            this.io.writeStderr( [subject, ...details].join(' ') + "\n");
        }
    }

    info(subject, ...details)
    {
        if(!this.options.quiet) {
            this.infos.push([...arguments].join(' '));
            this.report(this.io.console.info, chalk.green, subject, ...details);
        }
    }

    debug(subject, ...details)
    {
        if(this.isDebug && subject.includes(this.options.debug)) {
            this.debugs.push([...arguments].join(' '));
            this.report(this.io.console.log, chalk.cyan, "[Debug] " + subject + ":", ...details);
        }
    }

    warn(...messages)
    {
        this.warnings.push(messages.join(' '));
        this.report(this.io.console.warn, chalk.yellow, "Warning:", ...messages);
    }

    error(...messages)
    {
        this.errors.push(messages.join(' '));
        this.report(this.io.console.error, chalk.red, "Error:", ...messages);
    }

    result( aResult )
    {
        if( this.errors.length )
        {
            this.warn("Result might be invalid because of errors:\n", aResult);
            return;
        }

        this.results.push(aResult);

        if( this.io.acceptColors )
        {
            if(typeof aResult === 'string')
                aResult = chalk.blue(aResult);
            this.io.console.log(aResult);
        }

        else
        {
            // If not the first result, add a newline before
            if (this.results.lenght) this.io.writeStdout("\n");
            this.io.writeStdout(aResult);
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

};

