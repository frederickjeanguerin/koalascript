const tokenTypes = {
    js_line: "",
    unmatched_char: "",
};

enumify(tokenTypes);

function enumify(object) {
    for(const prop in object) {
        object[prop] = prop;
    }
    Object.freeze(object);
}

module.exports = tokenTypes;
