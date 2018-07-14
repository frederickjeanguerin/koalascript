module.exports = class Token {
    /**
     * @param {string} type     Type of token, e.g. 'identifier' or 'number'
     * @param {string} text     The token string itself
     * @param {number} index    Offset of the token in the source file (0 based)
     * @param {number} line     Line of the token in the source file (1 based).
     * @param {number} column      Column of the token in the source file (1 based).
     * @param {any} info        Additionnal info, related to the token type.
     */
    constructor(type, text, index, line, column, info = undefined){
        if(!type || !text || index < 0)
            throw "Invalid argument";
        this.type = type;
        this.text = text;
        this.index = index;
        this.line = line;
        this.column = column;
        this.info = info;
    }

    get length() {
        return this.text.length;
    }

    get end() {
        return this.index + this.length;
    }

    /**
     * @param  {string} source
     * @returns {{line: number, col: number, lineIndex: number}}
     */
    getPosition(source)
    {
        {
            if (typeof source !== 'string') {
                throw TypeError('source should be a string, not a: ' + typeof source);
            }
            // The token must be present in the source at the stated position.
            const found = source.slice(this.index, this.end);
            if( found !== this.text){
                throw `Token not in source code! Found: '${found}'`;
            }
        }

        const LF = "\n".charCodeAt(0);
        let line = 1;
        let col = 1;
        let lineIndex = 0;

        for (let index = 0; index < this.index; index++) {
            if(source.charCodeAt(index) === LF)
            {
                col = 1;
                line++;
                lineIndex = index + 1;
            }
            else
            {
                col++;
            }
        }
        return {line, col, lineIndex};
    }

    /**
     * @param  {string} source
     * @returns {string}
     */
    getMessage(source)
    {
        const {line, col, lineIndex} = this.getPosition(source);

        // The startLine is the line in source code where the token starts.
        // The lineEnd is the index in source where this startLine ends.
        // We must look for the lineEnd.
        let lineEnd = source.indexOf("\n", this.index);
        if( lineEnd === -1) lineEnd = source.length;
        let startLine = source.slice(lineIndex, lineEnd);

        // The tokenCol is the col in the startLine where the token starts
        let tokenCol = col - 1;

        // If the startLine is too long, we want to show only part of it.
        if( tokenCol > 80 )
        {
            // We truncate the line at the beginning
            startLine = "..." + startLine.slice(tokenCol - 47);
            tokenCol = 50;
        }
        if(startLine.length > 100)
        {
            // We truncate the line at the ending
            startLine = startLine.slice(0, 97) + "...";
        }

        let message = " at line " + line + " col " + col + ":\n";
        message += "  " + startLine + "\n";
        message += "  " + startLine.slice(0,tokenCol).replace(/\S/ug, " ")
            + "^".repeat(Math.min(this.length, startLine.length - tokenCol));
        return message;
    }
};
