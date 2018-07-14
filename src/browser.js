const {sourceMapComment} = require('./util');
const kgen = require('./kgen');
const Logger = require('./logger');
const io = require('./io-browser');

(async function(window){

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
        // clear previous errors if any.
        log.restore();

        let kcode, sourceName;

        if (kscript.src) // try to load source file
        {
            try
            {
                sourceName = kscript.src;
                const response = await fetch(sourceName);
                if (response.ok)
                {
                    kcode = await response.text();
                }
                else
                {
                    console.error("Can't reach: " + sourceName);
                }
            }
            catch(e)
            {
                console.error(e);
            }
        }

        if (!kcode) // if no src or if src failed, go for script tag content
        {
            kcode = kscript.innerHTML;
            sourceName = "inline-kscript-" + i;
        }

        if(!kcode) continue;

        const {jscode, jsonSourceMap} = kgen(log, kcode, {sourceName});

        if(!jscode) continue;

        const newScript = document.createElement("script");
        const inlineScript = document.createTextNode(
            jscode + "\n\n"
            + sourceMapComment(jsonSourceMap));
        newScript.appendChild(inlineScript);
        document.body.appendChild(newScript);
    }

})(typeof window === "undefined" ? undefined : window);
