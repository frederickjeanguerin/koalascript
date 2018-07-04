const gen = require('./generator');
const Logger = require('./logger');

(function(window){

    if(!window)
    {
        console.error("This script should be run in the browser");
        return;
    }

    const document = window.document;

    const log = new Logger({options:{mute:false}});
    for( const kscript in document.querySelectorAll('script[type="text/k"]'))
    {
        const kcode = kscript.innerHtml;
        const {jscode, sourceMap} = gen(log, kcode, {sourceName:"inline"});
        var newScript = document.createElement("script");
        var inlineScript = document.createTextNode("console.log('Script added');\n" + jscode + "\n\n" + sourceMap);
        newScript.appendChild(inlineScript);
        // todo insert before instead
        // kscript.parentNode.insertBefore(newScript, kScript);
        document.appendChild(newScript);
    }

})(typeof window === "undefined" ? undefined : window);
