const path = require('path');

module.exports = {
    entry: './src/browser.js',
    output: {
        filename: '_browser.js',
        path: path.resolve(__dirname, 'src')
    }
};
