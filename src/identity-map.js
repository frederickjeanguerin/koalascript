const {default: jsTokens, matchToToken} = require("js-tokens");
const sourceMap = require("source-map");
const path = require('path-parse');
const isKeyword = require('is-keyword-js');

const newline = /\r\n?|\n/;

module.exports = function identityMap (
    jscode = "",
    {
        sourceName = "default",
        line = 1,
        column = 0,
        mapPunctuators = false,
        mapComments = false,
        mapInvalid = false,
        addNames = false
    } = {}
) {

    const tokens = jscode.match(jsTokens);

    const map = new sourceMap.SourceMapGenerator({
        file: path.basename(sourceName)
    });

    for(const token of tokens)
    {
        const {type, closed} = matchToToken(token);
        void closed; // we dont care if a comment or string is unclosed.
        const skipMapping =
            type === 'whitespace'
            || mapComments && type === 'comment'
            || mapInvalid && type === 'invalid'
            || mapPunctuators && type === 'punctuator'
            ;
        if(!skipMapping) {
            map.addMapping({
                generated: {
                    line,
                    column
                },
                original: {
                    line,
                    column
                },
                sourceName,
                name: addNames && type === 'name' && !isKeyword(token) ? token : undefined,
            });
        }

        // update line and column
        const lines = token.split(newline);
        const lastLine = lines.pop();
        const addedLines = lines.length;
        if (addedLines) {
            line += addedLines;
            column = lastLine.length;
        } else {
            column += lastLine.length;
        }
    }

    return map;
};
