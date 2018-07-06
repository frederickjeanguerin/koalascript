const
    nearley = require("nearley"),

    grammar = require("./_grammar"),
    Logger = require("./logger"),

    // Create a Parser object from grammar.
    kparser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar)),

    // Save initial parser state to reset it
    init_state = kparser.save();


module.exports = function kparse(       /* istanbul ignore next: type hint */
    log = new Logger(),                 /* istanbul ignore next: type hint */
    kcode = "",
    {selfContained = true}={})
{
    void selfContained; // unused for now

    let parsing;
    main : {
        // Parse the code from parser
        try
        {
            kparser.feed(kcode);
        }
        catch(err)  // Unexpected token
        {
            if(!err.token) throw err;
            log.error("Unexpected token", err.token.getMessage(kcode));
            break main;
        }

        // Get all possible parse trees
        const parsings = kparser.results;

        // We assume parsings array contains at least 1 parsing.
        // because even if there is nothing to parse, an empty parse tree will be returned.
        console.assert(parsings.length >= 0, parsings);

        /* istanbul ignore if : grammar should not be ambiguous */

        // If many parsings, the grammar is ambiguous
        // Output some debug info before continuing the process.
        if(parsings.length > 1)
        {
            let warning = ["Warning: Ambiguous grammar\n"];
            for(const [parsing, i] of parsings.entries())
            {
                warning.push(i);
                warning.push(":");
                warning.push(parsing);
                warning.push("\n");
            }
            warning.push(">>> Continuing with only the first one.\n");
            log.warn(warning);
        }

        // We concentrate on the first parsing only.
        // Actually this parsing contains a sequence of statements.
        parsing = parsings[0];

    }

    kparser.restore(init_state);
    return parsing;
};
