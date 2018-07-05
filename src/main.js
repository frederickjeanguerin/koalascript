module.exports = main;

const
    // External modules
    commandLineArgs = require('command-line-args'),

    // Internal modules
    Logger      = require("./logger"),
    compile     = require("./compile"),

    // Command line spec
    optionDefinitions = [

        // Use this option to output debug info.
        // Without any strings, no debug messages are reported.
        // With a string, debug messages with a subject including that string are reported.
        { name: 'debug', alias: 'd', type: String },

        // Use this options to disable progress messages.
        { name: 'quiet', alias: 'q', type: Boolean },

        // src: source files to compile or code to compile (option cmd),
        // If empty stdin used.
        { name: 'src', type: String, multiple: true, defaultOption: true },

        // run: source code should be run directly, no output to file or stdin
        { name: 'run', alias: 'r', type: Boolean },

        // cmd: command line source is raw K code, not files
        { name: 'cmd', alias: 'c', type: Boolean },

        // checkonly: code will only be checked
        { name: 'checkonly', type: Boolean },

        // noMap: by default, source maps are added to the produced code.
        // However this can be cancelled with this options.
        { name: 'noMap', type: Boolean },

        // saveConfig: save actual settings to config file, including actual arguments (except save),
        // overwriting config file if it already exists.
        // { name: 'configSave', alias: 's', type: Boolean },

        // Specify to override the default config file location and name.
        // if set to "null" no config file will be loaded.
        // { name: 'configFile', type: String },

    ],

    __end_const     = undefined;

/**
 * Main program: parses arguments then ask compile to do it.
 * Returns the exit code.
 * @param {Logger} log Logger used for logging compilation results and errors. Override for testing purpose.
 * @param {String[]} argv Arguments passed on command line. Override for testing purpose.
 */
async function main (           /* istanbul ignore next */
    log = new Logger,           /* istanbul ignore next */
    argv = process.argv )
{
    try
    {
        const args = commandLineArgs( optionDefinitions, { argv } );
        log.reconfig(args);
        await compile( log, args );
        return log.hasErrors? 1 : 0;
    }
    catch(e)
    {
        log.error("[main]", e);
        // TODO output usage info
        return 1;
    }
}
