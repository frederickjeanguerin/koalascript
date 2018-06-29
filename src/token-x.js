const Token = require('./token');

let word = 'koala';
let source = `+ coco \n\n${Array.from(Array(50).keys())}  ${word}`;
let token = new Token('WORD', word, source.indexOf(word));
console.log(token.getMessage(source));

source = `+ coco \n\n  ${word}  ${Array.from(Array(50).keys())}`;
token = new Token('WORD', word, source.indexOf(word));
console.log(token.getMessage(source));

source = `+ coco \n\n${Array.from(Array(50).keys())}  ${word}  ${Array.from(Array(50).keys())}`;
token = new Token('WORD', word, source.indexOf(word));
console.log(token.getMessage(source));

word = 'koala'.repeat(100);
source = `+ coco \n\n${Array.from(Array(50).keys())}  ${word}`;
token = new Token('WORD', word, source.indexOf(word));
console.log(token.getMessage(source));
