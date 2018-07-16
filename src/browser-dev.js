const browserMain = require('./browser-main');

if(!window.kgen)
{
    console.error("kgen module should be loaded before browser")
}

console.warn("Klang module loading : not intended for production!");

console.log('fetch:', window.fetch !== undefined)

console.log('kdebug:', window.kdebug)

window.kloaded = browserMain(window, window.kgen)

