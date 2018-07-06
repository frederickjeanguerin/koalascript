const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = [
    // Development
    {
        entry: './src/browser.js',
        output: {
            filename: '_browser.js',
            path: path.resolve(__dirname, 'src')
        },
        devtool: 'inline-source-map',
        mode: "development",
        plugins: [
            new BundleAnalyzerPlugin({
                analyzerMode: "static",
                reportFilename: "_browser-webpack-report.html",
                openAnalyzer: false,
            })
        ],
    },
    // Production
    {
        entry: './src/browser.js',
        output: {
            filename: '_browser.min.js',
            path: path.resolve(__dirname, 'src')
        },
        devtool: 'source-map',
        mode: "production",
        performance: {
            maxEntrypointSize: 300000,
            maxAssetSize: 300000,
        }
    },
];
