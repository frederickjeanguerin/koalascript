var Lexer = require('./flex');

var lexer = new Lexer();

// definitions
lexer.addDefinition('DIGIT', /[0-9]/);
lexer.addDefinition('LETTER', /\p{Letter}/);
lexer.addDefinition('ALPHANUM', /@LETTER|@DIGIT/);
lexer.addDefinition('ANY', /.*/)

// rules
lexer.addRule(/{DIGIT}+\.({DIGIT}+)/, function (lexer) {
  console.log('Found float: ' + lexer.text + '   fraction: ' + lexer.matchInfo[1]);
});
lexer.addRule(/@DIGIT+/, function (lexer) {
    console.log('Found integer: ' + lexer.text);
});
lexer.addRule(/@LETTER+/u, function (lexer) {
    console.log('Found word: ' + lexer.text);
});
lexer.addRule(/@ALPHANUM+/u, function (lexer) {
    console.log('Found alphanum: ' + lexer.text);
});
lexer.addRule(/[/][/]@@ANY/u, function (lexer) {
    console.log('Found comment:' + lexer.matchInfo.groups.ANY);
});
lexer.addRule(/\s+/);

// code
lexer.setSource('11.2 3.44 555 abcù 0x00AF // ☃☃ 💩 strange enough!');
lexer.lex();
