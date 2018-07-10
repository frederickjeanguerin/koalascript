const SysSyntaxError = require('./sys-syntax-error');

new SysSyntaxError("unexpected token", "this.js", 3, 20).log()

