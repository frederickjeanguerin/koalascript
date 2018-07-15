const browserMain = require('./browser-main');

if(!window.kgen)
{
    console.error("kgen module should be loaded before browser")
}

console.warn("Klang module loaded : not intended for production!");

browserMain(window, window.kgen)
