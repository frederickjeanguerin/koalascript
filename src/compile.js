module.exports = compile;

// We also export these for testing purpose
compile.compileCode = compileCode;
compile.runCode = runCode;
compile.compileFile = compileFile;

const
    // External modules
    convert = require('convert-source-map'),

    // Internal modules
    gen             = require("./generator"),
    RunJs           = require('./runjs'),
    Logger          = require("./logger"),
    samples         = require("./samples"),

    // Util functions
    { changeExt } = require('./util-node'),

    // Constants
    KExt            = '.k',
    JsExt           = '.js',
    STDOUT          = 'stdout',

    __end_const     = undefined;

async function compile (
    log,
    {
        src = [],           // Source files to compile
        cmd = false,        // true if source is from command line
        run = false,        // run jscode after compilation (and don't save/export it)
        checkonly = false,  // check code only (dont save and dont run)
        noMap = false,      // dont produce/embed source map file
    } = {},
){
    const compileCode_ = compileCode.bind(null, log, {checkonly, run, noMap});
    try
    {
        // If source from command line
        if (cmd)
        {
            const kcode = src.join(' ');
            compileCode_(kcode, "command-line");
        }

        // If source files to compile
        else if (src.length)
        {
            for(const file of src)
            {
                compileFile(log, compileCode_, file);
            }
        }

        // go for stdin
        else
        {
            // if stdin is the console
            if(log.stdin.isTTY){
                // We may lunch the repl from here, because stdin is the console...
                // For the moment, we pass in a test program.
                compileCode_(samples.kcode.helloFrom("fn CompileCode"), "internal-sample-program");
            }
            else
            {
                compileCode_(await log.readStdin(), "stdin");
            }
        }
    }
    catch(e)
    {
        // These are development errors, not user errors.
        /* istanbul ignore next */
        log.error("[Internal Error]", e);
    }

}

// *Default args are provided to give type hints.
function compileFile(               /* istanbul ignore next */
    log = new Logger,               /* istanbul ignore next */
    compileCode = new Function,     /* istanbul ignore next */
    fileName = "")
{
    const targetName = changeExt(fileName, JsExt, KExt);
    if(!targetName)
    {
        log.error('File', fileName, 'should have extension', KExt,
            "\nNB: To compile any file extension, use the compiler in stdin/stdout mode.");
        return;
    }

    log.info('Compiling:', fileName, " -> ", targetName);

    const kcode = log.readFile(fileName);

    if (kcode)
    {
        compileCode(kcode, fileName, targetName);
    }
}


// *Most default args (but the last) are provided to give type hints.
function compileCode(   /* istanbul ignore next */
    log = new Logger,
    {checkonly = false, run = false, noMap = false} = {},
    kcode = "",
    sourceName = "unspecified",
    targetFile = STDOUT)
{
    if (!kcode)
    {
        log.error("No source code in:", sourceName);
        return;
    }

    let { jscode, sourceMap } = gen(log, kcode, {sourceName});

    if (log.hasErrors) return;

    if(checkonly)
    {
        log.info("Check:", "ok");
        return;
    }

    if (run)
    {
        runCode(log, jscode);
        return;
    }

    if(!noMap)
    {
        jscode += "\n\n\n" + convert.fromObject(sourceMap).toComment();
    }

    if(targetFile === STDOUT)
    {
        log.result(jscode);
    }
    else
    {
        log.saveFile(targetFile, jscode);
    }
}
compileCode.STDOUT = STDOUT;

/**
 * Run the given code and log the result.
 * Console.log and other I/O are not monitored.
 * Only the result is
 * @param  {string} jscode
 * @param  {Logger} log
 */
function runCode(log, jscode)
{
    const runjs = new RunJs;
    const {result, error} = runjs.run(jscode);
    if (error)
        // TODO This is not a compilation error, and should probably be reported on some other channel.
        log.error("[Runtime error]", error);
    else if (result !== undefined)
        log.result(result);
}
