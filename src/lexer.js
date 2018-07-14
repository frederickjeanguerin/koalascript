"use strict";
module.exports = Lexer;
Lexer.Actions = Actions;

const {nextPosition} = require('./util');
const isNode = typeof window === 'undefined';
const idRegExp = /[a-z_][a-z0-9_-]*/i;

/**
 * FLEX.JS - FLEX-like lexer.
 *
 * @class Lexer
 *
 * from: https://github.com/sormy/flex-js
 *
 * modified by: FG.
 *
 */
function Lexer() {
    this.actions = Actions(this);
    this.clear();
}

/**
 * End of file indicator.
 *
 * @const
 * @public
 */
Lexer.EOF = 0;

/**
 * Default initial inclusive state name.
 *
 * @const
 * @public
 */
Lexer.STATE_INITIAL = 'INITIAL';

/**
 * State name reserved to match with any inclusive/exclusive state.
 *
 * @const
 * @public
 */
Lexer.STATE_ANY = '*';

/**
 * Rule indicating EOF.
 *
 * @const
 * @public
 */
Lexer.RULE_EOF = '<<EOF>>';

/**
 * Reset lexer state but keep configuration.
 *
 * @param {?string} source = ''
 * @param {?string} state  = STATE_INITIAL
 * @public
 */
Lexer.prototype.reset = function (source = '', state = Lexer.STATE_INITIAL) {
    this.setSource(source);
    this.matchInfo = undefined;
    this.text = undefined;
    this.state = state;

    this.ruleIndex = undefined;
    this.readMore = false;
    this.stateStack = [];
    this.rejectedRules = [];
};

/**
 * Reset lexer configuration and internal state.
 *
 * @public
 */
Lexer.prototype.clear = function () {
    this.states = {};
    this.definitions = [];
    this.rules = {};
    this.ignoreCase = false;
    this.useUnicode = false;
    this.debugEnabled = false;
    this.unmatchedCharFn = undefined;

    this.addState(Lexer.STATE_INITIAL);

    this.reset();
};

/**
 * Set ignore case mode.
 *
 * By default it is case sensitive.
 *
 * @param {boolean} ignoreCase
 * @returns {Lexer}
 * @public
 */
Lexer.prototype.setIgnoreCase = function (ignoreCase) {
    this.ignoreCase = ignoreCase;
    return this;
};

/**
 * Set unicode mode.
 *
 * By default unicode mode is not enabled.
 *
 * @param {boolean} useUnicode
 * @returns {Lexer}
 *
 * @public
 */
Lexer.prototype.setUseUnicode = function (useUnicode) {
    this.useUnicode = useUnicode;
    return this;
};

/**
 * Set debug enabled.
 *
 * By default it is disabled.
 *
 * @param {boolean} debugEnabled
 * @returns {Lexer}
 *
 * @public
 */
Lexer.prototype.setDebugEnabled = function (debugEnabled) {
    this.debugEnabled = debugEnabled;
    return this;
};

/**
 * Add additional state
 *
 * @param {string}  name
 * @param {boolean} [exclusive]
 * @returns {Lexer}
 */
Lexer.prototype.addState = function (name, exclusive) {
    this.states[name] = {
        name: name,
        exclusive: !!exclusive
    };
    return this;
};

/**
 * Add definition.
 *
 * @param {string}        name        Definition name, case sensitive.
 * @param {string|RegExp} expression  Expression, can't use flags.
 * @returns {Lexer}
 *
 * @public
 */
Lexer.prototype.addDefinition = function (name, expression) {
    if (typeof name !== 'string' || !idRegExp.test(name)) {
        throw new Error('Invalid definition name "' + name + '"');
    }

    if (typeof expression === 'string') {
        if (expression.length === 0) {
            throw new Error('Empty expression for definition "' + name + '"');
        }
        expression = Lexer.escapeRegExp(expression);
    } else if (expression instanceof RegExp) {
        if (expression.source === '(?:)') {
            throw new Error('Empty expression for definition "' + name + '"');
        }
        if (expression.flags !== '') {
            throw new Error('Expression flags are not supported for definition expressions');
        }
        expression = this.expandDefinitions(expression.source);
    } else {
        throw new Error('Invalid expression for definition "' + name + '"');
    }

    this.definitions[name] = expression;
    return this;
};

/**
 * Add definition.
 *
 * @param {Array<Array>} definitions Definition name, case sensitive.
 * @returns {Lexer}
 *
 * @public
 */
Lexer.prototype.addDefinitions = function (...definitions) {
    for (let def of definitions) {
        this.addDefinition(...def);
    }
    return this;
};

/**
 * Add state-specific rule.
 *
 * Action return value 0 is reserved for TERMINATE action.
 * Action return value undefined is reserved for DISCARD action.
 * Any other value could be used as return value from action as token.
 *
 * @param {string[]|string} states      Single state or state array, case sensitive.
 * @param {string|RegExp}   expression  Expression, can use flags and definitions.
 * @param {function}        [action]    Default action is DISCARD.
 * @returns {Lexer}
 *
 * @public
 */
Lexer.prototype.addStateRule = function (states, expression, action) {
    if (states === undefined || states === null) {
        // convert default state into list of target states
        states = [];
        for (let index in this.states) {
            const state = this.states[index];
            if (!state.exclusive) {
                states.push(state.name);
            }
        }
    } else if (states === Lexer.STATE_ANY) {
        // convert any state into list of target states
        states = [];
        for (let index in this.states) {
            const state = this.states[index];
            states.push(state.name);
        }
    } else if (typeof states === 'string') {
        // convert single state into list of target states
        states = [states];
    }

    // filter empty states
    states = states.filter(function (state) {
        return !!state;
    });

    // validate if we have at least one state to add rule into
    if (!states.length) {
        throw new Error('Unable to add rule to empty list of states');
    }

    // do not allow to add rules into not registered states
    var notRegisteredStates = states.reduce(function (acc, state) {
        if (!this.states[state]) {
            acc.push(state);
        }
        return acc;
    }.bind(this), []);
    if (notRegisteredStates.length) {
        throw new Error('Unable to register rule within unregistered state(s): ' + notRegisteredStates.join(', '));
    }

    var source;
    var flags;
    var fixedWidth;

    if (expression === Lexer.RULE_EOF) {
        source = null;
    } else if (typeof expression === 'string') {
        if (expression.length === 0) {
            throw new Error('Empty expression for rule "' + name + '"');
        }
        source = Lexer.escapeRegExp(expression);
        fixedWidth = expression.length;
        flags = '';
    } else if (expression instanceof RegExp) {
        if (expression.source === '(?:)') {
            throw new Error('Empty expression for rule "' + name + '"');
        }
        if (expression.flags !== '') {
            var notSupportedFlags = expression.flags
                .split('')
                .filter(function (flag) {
                    return flag !== 'i' && flag !== 'u';
                });
            if (notSupportedFlags.length) {
                throw new Error('Expression flags besides "i" and "u" are not supported');
            }
        }
        source = expression.source;
        flags = expression.flags;
    } else {
        throw new Error('Invalid rule expression "' + expression + '"');
    }

    if (action && typeof action !== 'function') {
        throw new Error('Invalid rule action: should be function or empty');
    }

    var compiledExpression = source === null ? null : this.compileRuleExpression(source, flags);
    var hasBOL = compiledExpression === null ? null : Lexer.isRegExpMatchBOL(compiledExpression);
    var hasEOL = compiledExpression === null ? null : Lexer.isRegExpMatchEOL(compiledExpression);
    var isEOF = source === null;

    var rule = {
        expression: compiledExpression,
        hasBOL: hasBOL,
        hasEOL: hasEOL,
        isEOF: isEOF,
        action: action,
        fixedWidth: fixedWidth // used for weighted match optmization
    };

    for (var index in states) {
        var state = states[index];
        if (!this.rules[state]) {
            this.rules[state] = [];
        }
        this.rules[state].push(rule);
    }
    return this;
};

/**
 * Add multiple rules into one or more states at once.
 *
 * @param {string[]|string} states     Single state or state array, case sensitive.
 * @param {Array}          rules       Each item should be [expression, action].
 * @returns {Lexer}
 *
 * @public
 */
Lexer.prototype.addStateRules = function (states, ...rules) {
    for (let rule of rules) {
        this.addStateRule(states, ...rule);
    }
    return this;
};

/**
 * Add rule without explicit state.
 *
 * Based on inclusive/exclusive state option it could be available within any state
 * or within specific states.
 *
 * @param {string|RegExp} expression
 * @param {function}      [action]    Default action is DISCARD.
 * @returns {Lexer}
 *
 * @public
 */
Lexer.prototype.addRule = function (expression, action) {
    this.addStateRule(undefined, expression, action);
    return this;
};

/**
 * Add multiple rules without explicit state.
 *
 * @param {Array}          rules       Each item should have [expression, action]
 * @returns {Lexer}
 *
 * @public
 */
Lexer.prototype.addRules = function (...rules) {
    this.addStateRules(undefined, ...rules);
    return this;
};

/**
 * Set source text string to lex.
 *
 * @param {string} source
 * @returns {Lexer}
 *
 * @public
 */
Lexer.prototype.setSource = function (source) {
    this.source = source;
    this.resetIndex();
    return this;
};

/**
 * Run lexer until end or until token will be found.
 *
 * @return Either EOF {@link Lexer.EOF} or specific token produced by action.
 *
 * @public
 */
Lexer.prototype.lex = function () {
    let result = this.scan();
    // Apparently, scan always return EOF when EOF is reached (not just once).
    // Hence we may safely scan again if undefined.
    while (result === undefined) {
        result = this.scan();
    }
    // However, lex returns undefined when EOF has been reached.
    if ( result === Lexer.EOF ) return undefined;
    return result;
};

/**
 * Run lexer until end, collect all tokens into array and return it.
 *
 * @return {Array} Array of tokens.
 *
 * @public
 */
Lexer.prototype.lexAll = function (source = undefined) {
    if(source !== undefined)
        this.reset(source + "");
    var tokens = [];
    let token;
    while ((token = this.lex()) != undefined) {
        tokens.push(token);
    }
    return tokens;
};

/**
 * Push State.
 *
 * @param {string} newState
 *
 * @public
 */
Lexer.prototype.pushState = function (newState) {
    if (!this.states[newState]) {
        throw new Error('State "' + newState + '" is not registered');
    }
    this.stateStack.push(this.state);
    this.begin(newState);
};

/**
 * Get top state.
 *
 * @return {string} top state
 *
 * @public
 */
Lexer.prototype.topState = function () {
    if (!this.stateStack.length) {
        return undefined;
    }
    return this.stateStack[this.stateStack.length - 1];
};

/**
 * Pop state.
 *
 * @public
 */
Lexer.prototype.popState = function () {
    if (!this.stateStack.length) {
        throw new Error('Unable to pop state');
    }
    var oldState = this.stateStack.pop();
    this.begin(oldState);
};

/**
 * Get state.
 *
 * @returns {string}
 * @public
 */
Lexer.prototype.getState = function () {
    return this.state;
};

/**
 * Switch state.
 *
 * @param {string} [newState] Switch to specific state or initial if omitted.
 * @returns {Lexer}
 * @public
 */
Lexer.prototype.switchState = function (newState) {
    this.begin(newState);
    return this;
};

/**
 * Scan for one token.
 *
 * @private
 */
Lexer.prototype.scan = function () {
    var isEOF = this.index >= this.source.length;

    var matchedRule;
    var matchedIndex;
    var matchedValue = '';
    var matchedValueLength = 0; // could be 1 char more than matchedValue for expressions with $ at end
    var matchedInfo;

    var rules = this.rules[this.state] || [];
    for (var index in rules) {
        if (this.rejectedRules.indexOf(index) !== -1) {
            continue;
        }

        var rule = rules[index];

        if (isEOF) {
            // skip non EOF rules
            if (rule.isEOF) {
                matchedRule = rule;
                matchedIndex = index;
                matchedValue = '';
                matchedInfo = undefined;
                // no need to search for other EOF rules
                break;
            }
        } else {
            if (rule.fixedWidth === undefined ||
                rule.fixedWidth > matchedValueLength
            ) {
                var curMatchInfo = this.execRegExp(rule.expression);
                var curMatch = curMatchInfo ? curMatchInfo[0] : undefined;
                if (curMatch !== undefined) {
                    var curMatchLength = curMatch.length;

                    if (rule.hasBOL) {
                        curMatchLength++;
                    }
                    if (rule.hasEOL) {
                        curMatchLength++;
                    }

                    if (curMatchLength > matchedValueLength) {
                        matchedRule = rule;
                        matchedIndex = index;
                        matchedValue = curMatch;
                        matchedValueLength = curMatchLength;
                        matchedInfo = curMatchInfo;
                    }
                }
            }
        }
    }

    if (matchedRule && this.debugEnabled) {
        Lexer.logAccept(this.state, matchedRule.expression, matchedValue);
    }

    this.ruleIndex = matchedIndex;
    this.text = this.readMore ? this.text : '';
    this.readMore = false;
    this.matchInfo = matchedInfo;

    if (!matchedRule) {
        if (!isEOF) {
            const unmatchedChar = this.source.charAt(this.index);
            this.text += unmatchedChar;
            let token;
            if(this.unmatchedCharFn){
                token = this.unmatchedCharFn(this.actions);
            }
            this.advanceIndex();
            return token || this.actions.echo();
        } else {
            this.text = '';
            return this.actions.terminate();
        }
    }

    this.text += matchedValue;
    var rejectedBefore = this.rejectedRules.length;
    var actionResult = matchedRule.action ? matchedRule.action(this.actions) : this.actions.discard();
    var hasRejection = this.rejectedRules.length > rejectedBefore;
    // reset reject state if there is no rejection in last action
    if (hasRejection) {
        // ignore result if there is rejection in action
        return;
    }

    this.advanceIndex(this.text.length);
    this.rejectedRules = [];

    // rule action could change buffer or position, so EOF state could be changed too
    // we need revalidate EOF only if EOF was identified before action were executed
    if (isEOF) {
        isEOF = this.index >= this.source.length;
    }

    return isEOF ? this.actions.terminate() : actionResult;
};

/**
 * @private
 */
Lexer.logAccept = function (state, expression, value) {
    console.log(
        ' - [' + state + '] accepting rule' +
        ' /' + encodeString(expression.source) + '/' +
        ' ("' + encodeString(value) + '")'
    );
    return;

    function encodeString(s) {
        return s.replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n')
            .replace(/\t/g, '\\t')
            .replace(/\f/g, '\\f')
            .replace(/\0/g, '\\0');
    }
};

/**
 * @private
 */
Lexer.prototype.execRegExp = function (re) {
    re.lastIndex = this.index;
    return re.exec(this.source);
};

/**
 * @private
 */
Lexer.prototype.compileRuleExpression = function (source, flags) {
    if (this.ignoreCase && flags.indexOf('i') === -1) {
        flags += 'i';
    }
    if (this.useUnicode && flags.indexOf('u') === -1) {
        flags += 'u';
    }

    // sticky flag required for engine to work
    // multiline flag required to be able to match line start
    return new RegExp(this.expandDefinitions(source), flags + 'ym');
};

/**
 * @param  {string} source Definition or Rule to expand
 * @returns {string}        Expanded source
 * @private
 */
Lexer.prototype.expandDefinitions = function (source) {
    return Lexer.expandDefinitions(this.definitions, source);
};

Lexer.prototype.resetIndex = function(offset = 0)
{
    const {line, col} = nextPosition(this.source, offset, 0, 1, 0);
    this.index = offset;
    this.line = line;
    this.col = col;
};

Lexer.prototype.advanceIndex = function(offset = 1)
{
    const {line, col} = nextPosition(this.source, this.index + offset, this.index, this.line, this.col);
    this.index = this.index + offset;
    this.line = line;
    this.col = col;
};

/**
 * Expands definitions in source.
 *
 * @param {Object<string,(string|RegExp)>} definitions
 * @param {string} source   Definition or Rule
 * @returns {string}        Expanded source
 */
Lexer.expandDefinitions = function (definitions, source) {

    for (var defName in definitions) {
        var defExpression = definitions[defName];

        // Continue with next definition if not applicable
        if (!source.includes('@' + defName)) continue;

        source = source
            // Replace @@Definition by a capture block
            .replace(
                new RegExp('(?<!\\\\)@@' + defName, 'g'),
                `(?<${defName}>${defExpression})`
            )

            // Replace @Definition by a non capturing block
            .replace(
                new RegExp('(?<!\\\\)@' + defName, 'g'),
                '(?:' + defExpression + ')'
            );

    }
    return source;
};

/**
 * Escapes string s to make it RegExp compatible
 * @param  {string} s
 */
Lexer.escapeRegExp = function (s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * @param  {RegExp} re
 */
Lexer.isRegExpMatchBOL = function (re) {
    // primitive detection but in most cases it is more than enough
    return re.source.substr(0, 1) === '^';
};

/**
 * @param  {RegExp} re
 */
Lexer.isRegExpMatchEOL = function (re) {
    // primitive detection but in most cases it is more than enough
    return re.source.substr(-1) === '$';
};

/**
 * If no unmatchedCharFn is defined, any unmatchedChar is simply ignored.
 * Otherwise this function is called, with the following args:
 *
 * 1. unmatchedChar: string
 * 2. index: offset in source code
 * 3. source: source code
 *
 * If this function returns something (e.g. a token),
 * that something will be returned to the client (e.g. the parser).
 * If this function returns undefined, lexing will simply continue with the next character,
 * hence no error and nothing returned to the client.
 *
 * @param  {function(Action)} unmatchedCharFn
 * @return {Lexer}
 * @public
 */
Lexer.prototype.setUnmatchedCharFn = function(unmatchedCharFn){
    this.unmatchedCharFn = unmatchedCharFn;
    return this;
};

/**
 * Returns the actions and properties available inside rules.
 */
function Actions(lexer = new Lexer)
{
    return {

        get lexer ()
        {
            return lexer;
        },

        get text ()
        {
            return lexer.text;
        },

        get index ()
        {
            return lexer.index;
        },

        get line ()
        {
            return lexer.line;
        },

        get col ()
        {
            return lexer.col;
        },

        get info ()
        {
            return lexer.matchInfo;
        },

        discard ()
        {
            return undefined;
        },

        echo ()
        {
            if (isNode) {
                process.stdout.write(lexer.text);
            } else {
                console.log(lexer.text);
            }
        },

        begin (newState = Lexer.STATE_INITIAL)
        {
            if (!lexer.states[newState]) {
                throw new Error('State "' + newState + '" is not registered');
            }
            lexer.state = newState;
        },

        reject()
        {
            lexer.rejectedRules.push(lexer.ruleIndex);
        },

        more()
        {
            lexer.readMore = true;
        },

        /**
         * @param {number} n
         */
        less (n)
        {
            lexer.text = lexer.text.substr(0, n);
        },

        /**
         * @param {string} s
         */
        unput (s = "")
        {
            const insertionIndex = lexer.index + lexer.text.length;
            lexer.source = lexer.source.substr(0, insertionIndex) + s + lexer.source.substr(insertionIndex);
        },

        /**
         * @param {number} n
         *
         * @return {string} read from current position (up to N characters).
         */
        input (n)
        {
            var value = lexer.source.substr(lexer.index + lexer.text.length, n === undefined ? 1 : n);
            lexer.advanceIndex(value.length);
            return value;
        },

        terminate ()
        {
            lexer.reset();
            return Lexer.EOF;
        },

        restart (newSource) {
            if (newSource !== undefined) {
                lexer.setSource(newSource);
            }
            lexer.resetIndex();
        },
    };
}
