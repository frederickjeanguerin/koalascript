const {readAll, stringAsStream} = require('./util');

(async () => {
    console.log(await readAll(stringAsStream("10")));
    console.log(await readAll(stringAsStream(undefined)));
    console.log(await readAll(undefined));
})();
