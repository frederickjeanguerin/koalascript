const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = [
    // Development
    {
        entry: {
            browserdev: './src/browser-dev.js',
            browserkgen: './src/browser-kgen.js',
        },
        output: {
            filename: '_[name].bundle.js',
            path: path.resolve(__dirname, 'src')
        },
        devtool: 'source-map', // inline-source-map
        mode: "development",
        plugins: [
            new BundleAnalyzerPlugin({
                analyzerMode: "static",
                reportFilename: "_browser-webpack-report.html",
                openAnalyzer: false,
            })
        ],
        node: {
            fs: "empty",
            Buffer: false,
        },
        externals: {
            buffer: 'Buffer'
        }
    },
    // Production
    // {
    //     entry: './src/browser.js',
    //     output: {
    //         filename: '_browser.min.js',
    //         path: path.resolve(__dirname, 'src')
    //     },
    //     devtool: 'source-map',
    //     mode: "production",
    //     performance: {
    //         maxEntrypointSize: 300000,
    //         maxAssetSize: 300000,
    //     },
    //     node: {
    //         fs: "empty"
    //     },
    // },
];
