const {sourceMapComment} = require('./util');
const gen = require('./generator');
const Logger = require('./logger');
const io = require('./io-browser');

(function(window){

    if(!window)
    {
        console.error("This script should be run in the browser");
        return;
    }

    console.warn("Klang module loaded : not intended for production!");

    const document = window.document;

    const log = new Logger({io});
    const kscripts = document.querySelectorAll('script[type="text/k"]');
    for( const [i, kscript] of kscripts.entries())
    {
        const kcode = kscript.innerHTML;
        const {jscode, sourceMap} = gen(log, kcode, {sourceName: ("inline-kscript-" + i)});
        if(!jscode) continue;
        const newScript = document.createElement("script");
        const inlineScript = document.createTextNode(
            jscode + "\n\n"
            + sourceMapComment(sourceMap));
        newScript.appendChild(inlineScript);
        document.body.appendChild(newScript);
    }

})(typeof window === "undefined" ? undefined : window);
