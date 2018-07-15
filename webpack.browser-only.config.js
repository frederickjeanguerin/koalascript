const config = require('./webpack.config')[0]
delete config.entry.browserkgen
// config.stats = 'verbose'
module.exports = config
