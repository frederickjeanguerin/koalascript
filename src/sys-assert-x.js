
const assert = require('./sys-assert')

assert(true);

try {
    assert(false);
}
catch(err)
{
    err.log();
}

try {
    assert.eq(1,0);
}
catch(err)
{
    err.log();
}
