module.exports = kgen;

const kparse = require('./kparse')
const emit = require('./emit')
const sys = require('./sys')

function kgen( kcode, { parseOnly = false, sourceName = "kgen" } = {})
{
    let jscode, jsonSourceMap, emitErrors = []

    const { parsing, errors } = kparse(kcode, sourceName)

    if( !errors.length && !parseOnly ) {
        ({jscode, jsonSourceMap, errors: emitErrors} = emit(parsing, kcode, sourceName))
    }

    errors.push(...emitErrors)

    errors.forEach(err => {
        sys.assert(err instanceof sys.SyntaxError)
        err.source = kcode
    });

    return {parsing, jscode, jsonSourceMap, errors}
}

