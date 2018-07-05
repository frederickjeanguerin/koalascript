const
    main    = require('./main'),
    io      = require("./io-node"),
    Logger  = require("./logger");


(async () => {
    process.exit(await main(new Logger({io})));
})();
