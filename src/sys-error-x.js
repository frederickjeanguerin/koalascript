const SysError = require('./sys-error');

const error = new SysError("bad boy!")
console.log("trace: filtered: ", error.filteredStack())
console.log("trace: none: ", error.filteredStack("not in trace"))
console.log("trace: all: ", error.filteredStack(""))
