const main = require('./main');
// main(undefined, ['--invalid']);
(async () => {
    process.exit(await main());
})();
