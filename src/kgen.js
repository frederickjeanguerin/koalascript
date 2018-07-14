module.exports = kgen;

const
    kparse = require('./kparse'),
    emit = require('./emit'),

    ____end_const = undefined;

function kgen( kcode, { parseOnly = false, sourceName = "kgen" } = {})
{
    let jscode, jsonSourceMap, emitErrors = [];

    const { parsing, errors } = kparse(kcode, sourceName);

    if( !errors.length && !parseOnly ) {
        ({jscode, jsonSourceMap, errors: emitErrors} = emit(parsing, kcode, sourceName));
    }

    errors.push(...emitErrors)

    return {parsing, jscode, jsonSourceMap, errors};
}

