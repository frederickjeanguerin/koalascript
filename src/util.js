module.exports =
{
    countLines,
    countChar,
    readAll,
    runCmd,
    stringAsStream,
    changeExt,
    nextPosition,
};

const
    concat  = require('concat-stream'),
    exec    = require('child_process').exec,
    path    = require('path'),
    Readable = require('stream').Readable;

/**
 * @param  {string} text
 * @returns {number} Number of lines of text (new line + 1)
 */
function countLines(text) {
    return countChar(text, '\n') + 1;
}

/**
 * @param  {string} text
 * @param  {string} char
 * @returns {number} Number of occurences of char in string
 */
function countChar (text, char) {
    let result = 0;
    for(let i = 0; i < text.length; i++)
        if( text[i] === char[0]) result++;
    return result;
}

/**
 * @param  {string} str
 * @return {Readable}
 */
function stringAsStream(str) {
    const stream =  new Readable;
    stream.push(str+"");
    stream.push(null);
    return stream;
}
/**
 * @param  {Readable} inputStream
 * @return {string}
 */
async function readAll(inputStream) {
    return new Promise( (resolve, reject) => {
        inputStream.on('error', err => reject(err));
        inputStream.pipe( concat( data => resolve( data.toString() ) ) );
    });
}

/**
 * @param  {string} pipeIn input to the program via stdin
 * @param  {string} cmdLine command to launch as a command line
 * @return {[string]} [stdout, stderr]
 *
 * NB Istanbul doesnt like this function (path to node is not resolved who knows why), so we dont test it.
 */
async function runCmd(pipeIn = "", cmdLine = "node")
{
    return new Promise( (resolve, reject) => {
        const cmd = exec(cmdLine, (err, stdoutLog, stderrLog) => {
            // err is apparently always included in stderrLog,
            // thus more stderrLog is more useful
            if (err) reject (err);
            else resolve([stdoutLog, stderrLog]);
        });

        cmd.stdin.write(pipeIn);
        cmd.stdin.end();
    });
}

/**
 * Change file extension name.
 * If fromExt is provided, a check will be made to ensure the file extension has that name, else undefined is returned.
 * @param  {string} fileName    e.g. "path/to/file.ext"
 * @param  {string} newExt      e.g. ".foo"
 * @param  {string} fromExt     e.g. ".ext"
 */
function changeExt(fileName, newExt, fromExt = undefined){
    const { dir, ext, name } = path.parse(path.normalize(fileName));
    const newName = path.format({dir, name, ext: newExt});
    return fromExt && ext !== fromExt ? undefined : newName;
}

/**
 * Computes the next position {line, column} of a token from the position of a previous one.
 * Lines are counted starting at 1 and column starting at 1.
 */
function nextPosition ( /* istanbul ignore next: type hint */
    code = "",          /* istanbul ignore next: type hint */
    nextOffset = 0,     /* istanbul ignore next: type hint */
    prevOffset = 0,     /* istanbul ignore next: type hint */
    prevLine = 1,       /* istanbul ignore next: type hint */
    prevCol = 1,
) {
    let line = prevLine, col = prevCol;
    for( let offset = prevOffset; offset < nextOffset; offset++ ) {
        if(code[offset] === "\n") {
            col = 1;
            line ++;
        } else {
            col ++;
        }
    }
    return {line, col};
}
