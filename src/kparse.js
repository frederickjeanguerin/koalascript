module.exports = kparse;

const
    nearley = require("nearley"),

    grammar = require("./_grammar"),
    sys = require("./sys"),

    // Create a Parser object from grammar.
    kparser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar)),

    // Save initial parser state to reset it
    init_state = kparser.save();

function kparse( kcode, sourceName = "kparse")
{
    kparser.restore(init_state);
    let parsing, errors = [];
    try
    {
        kparser.feed(kcode);
        const parsings = kparser.results;

        sys.assert(parsings.length === 1, "Grammar is possibly ambiguous", {parsings});

        // We concentrate on the first parsing only.
        // Actually this parsing contains the sequence of statements.
        parsing = parsings[0];

        sys.assert(parsing instanceof Array)
    }
    catch(err)
    {
        if(!err.token) throw err;
        errors.push(new sys.SyntaxError("Unexpected token " + err.token.text, sourceName, err.token.line, err.token.column + 1))
    }

    return { parsing, errors };
};
