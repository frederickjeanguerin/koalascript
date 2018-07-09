if (typeof checkjs === 'undefined'){
    var checkjs = require('./checkjs');
}

var stmts = [
    "console.log(10)",
    "return 0",
    "await alert()",
];

stmts.forEach(function(stmt) {
    console.log(stmt, ":", checkjs.validateStmt(stmt), checkjs.validateExpr(stmt));
});
