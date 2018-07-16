const {sourceMapComment} = require('./util');

module.exports = async function browserMain (window, kgen) {

    const debug = (window.location.href.includes('debug') || window.kdebug) ? (...args) => console.log(...args) : () => {}

    const document = window.document;

    const kscripts = document.querySelectorAll('script[type="text/k"]');

    for( const [i, kscript] of kscripts.entries())
    {
        // scripts are executed sequentially at the moment
        // in case there is an order dependency between them
        await runKScript(kscript, i)
    }

    async function runKScript(kscript, i)
    {
        let kcode, sourceName

        if (kscript.src)
        {
            kcode = await fetchFile(kscript.src)
            sourceName = kscript.src
        }

        if (!kcode) // if no src or if src failed, go for script tag content
        {
            kcode = kscript.innerHTML
            sourceName = "inline-kscript-" + i
        }

        if(kcode) runKCode(kcode, sourceName)
    }

    async function fetchFile(url)
    {
        debug("fetching:", url)
        try
        {
            const response = await window.fetch(url);
            if (response.ok)
            {
                return await response.text();
            }
            else
            {
                console.error("Can't reach:", url, "\nresponse:", response);
            }
        }
        catch(e)
        {
            console.error(e);
        }
    }

    function runKCode(kcode, sourceName)
    {
        debug("running k:", kcode)

        const {jscode, jsonSourceMap, errors} = kgen(kcode, {sourceName})

        if(!jscode || errors.length)
        {
            for(const err of errors)
            {
                console.error(err.message)
            }
            return
        }

        runJsCode(jscode, jsonSourceMap)
    }

    function runJsCode(jscode, jsonSourceMap)
    {
        debug('running js:\n', jscode)
        const newScript = document.createElement("script");
        const inlineScript = document.createTextNode(
            jscode + "\n\n"
            + sourceMapComment(jsonSourceMap));
        newScript.appendChild(inlineScript);
        document.body.appendChild(newScript);
    }

};
