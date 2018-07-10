const {checkSyntax} = require('./jscheck');

var stmts = [
    "console.log(10)",
    "return 0",
    "await alert()",
    "\n\n\n\t\t10 +",
];

for(const stmt of stmts){
    // console.log(stmt, " -> ", checkSyntax(stmt, "jscheck-x").toString());
}

let stmt = "+"
console.log(stmt, " -> ", checkSyntax(stmt, "jscheck-x", undefined, 200).toString());
