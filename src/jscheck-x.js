const checkSyntax = require('./jscheck');

var stmts = [
    "console.log(10)",
    "return 0",
    "await alert()",
    "else { }",
    "   )   +   ",
    "\n\t\t10 +",
];

for(const stmt of stmts){
    console.log(stmt, " -> ", checkSyntax(stmt).toString());
    console.log(stmt, " -> ", checkSyntax(stmt, {assumeBrowser:true}).toString());
}
