// Testing framework
const chai = require('chai');
const expect = chai.expect;
chai.should();

const {JSDOM, VirtualConsole} = require('jsdom')
const fs = require('fs')

describe('browser', function() {

    it('#jsdom-loads-scripts', async function() {
        const {window, getLogs} = await newWindow(`
            <script>var coco = 10</script>
            <script>console.log('Hello JSDOM')</script>
            <script>console.log('foo', 'bar')</script>
            <script src="samples/js/basic.js"></script>
            <script src="src/_browserkgen.bundle.js"></script>
            <script src="src/_browserdev.bundle.js"></script>
        `)
        expect(window.coco).eq(10)
        getLogs().should.include.string('Hello JSDOM')
        getLogs().should.include.string('foo bar')
        expect(window.basicjs).eq(100)
        getLogs().should.include.string('Hello JS World')
        expect(window.kgen("  \n  \n ").jscode).eq("")
        getLogs().should.include.string('Klang module loading')
    });

    it('#jsdom-can-append-script-dynamically', async function() {
        const {window, getLogs} = await newWindow("")

        expect(window.coco).undefined
        await newScript(window.document, {jscode:"var coco = 10"})
        expect(window.coco).eq(10)

        await newScript(window.document, {jscode:"console.log(111)"})
        getLogs().should.include.string(111)

        window.coco = 100
        await newScript(window.document, {jscode:"window.coco += 10"})
        window.coco.should.eq(110)

        expect(window.basicjs).undefined
        window.basicjs = 10
        await newScript(window.document, {src:"samples/js/basic.js"})
        expect(window.basicjs).eq(110)
        getLogs().should.include.string('Hello JS World')

        await newScript(window.document, {src:"samples/js/basic.bundle.js"})
        expect(window.basicjs).eq(210)

    });

    it('#inline-script-run', async function() {
        const kmsg = "Hello K World"
        const {window, getLogs} = await newWindow(`
            <h1></h1>
            <script type="text/k">
                # output a simple message
                $ var mymsg = "${kmsg}"
                $ console.log(mymsg)
                $ document.querySelector('h1').innerHTML += mymsg + "<br>"
            </script>
            <script src="src/_browserkgen.bundle.js"></script>
            <script src="src/_browserdev.bundle.js"></script>
        `)
        expect(window.mymsg).eq(kmsg)
        getLogs().should.include.string(kmsg)
        expect(window.document.querySelector('h1').innerHTML).include.string(kmsg)
    });

    it('#extern-script-run', async function() {
        const {window, getLogs} = await newWindow(`
            <script type="text/k" src="samples/k/basic.k"></script>
            <script src="src/_browserkgen.bundle.js"></script>
        `)
        // We must provide our own fetch because jsdom window has no fetch
        window.fetch = fetch
        await newScript(window.document, {src:"src/_browserdev.bundle.js"})
        getLogs().should.include.string("Klang module loading")
        getLogs().should.include.string('From sample.k', getLogs())
    });

    it('#extern-script-not-found', async function() {
        const {window, getLogs} = await newWindow(`
            <script type="text/k" src="samples/k/basic.kk"></script>
            <script src="src/_browserkgen.bundle.js"></script>
        `)
        window.fetch = fetch
        await newScript(window.document, {src:"src/_browserdev.bundle.js"})
        getLogs().should.include.string("no such file or directory").string("basic.kk")
    });

    it('#extern-script-replaced-by-intern', async function() {
        const {window, getLogs} = await newWindow(`
            <script type="text/k" src="samples/k/empty.k">$ console.log("zouave")</script>
            <script type="text/k" src="samples/k/basic.kk">$ console.log("bachibouzouk")</script>
            <script src="src/_browserkgen.bundle.js"></script>
        `)
        window.fetch = fetch
        await newScript(window.document, {src:"src/_browserdev.bundle.js"})
        getLogs().should.include.string("bachibouzouk")
        getLogs().should.not.include.string("zouave")
    });

    it('#script-reports-kerror', async function() {
        const {getLogs} = await newWindow(`
            <h1></h1>
            <script type="text/k">
                $
            </script>
            <script src="src/_browserkgen.bundle.js"></script>
            <script src="src/_browserdev.bundle.js"></script>
        `)
        getLogs().should.include.string("Unexpected token $")
    });

    it('#script-reports-jserror', async function() {
        const {getLogs} = await newWindow(`
            <h1></h1>
            <script type="text/k">
                $ console.log(
            </script>
            <script src="src/_browserkgen.bundle.js"></script>
            <script src="src/_browserdev.bundle.js"></script>
        `)
        getLogs().should.include.string("Unexpected end of input")
    });

});

async function delay(timeout = 0) {
    return new Promise( (resolve, reject) => {
        setTimeout(()=> resolve(), timeout)
        void reject;
    })
}

function fetch(file){
    const data = fs.readFileSync(file)
    return {ok: true, text() {return data} }
}

async function newWindow(body = "", {normalConsole = false, url} = {}) {
    // let _consolemock = consolemock(console);
    let _logs = ""
    let virtualConsole

    if(!normalConsole) {
        virtualConsole = new VirtualConsole();
        ['log', 'warn', 'info', 'error'].forEach(event => {
            virtualConsole.on(event, (...err) => _logs += err.join(' ') + '\n')
        });
    }

    const dom = new JSDOM(
        html(body),
        { runScripts: "dangerously", resources: "usable", url, virtualConsole }
    )
    await loaded(dom.window)
    // if(!body && !normalConsole) dom.window.console = _consolemock
    return {window: dom.window, getLogs() {return _logs} };
}

function html(body) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>JSDOM testing</title>
    </head>
    <body>
${body}
    </body>
    </html>
    `
}

function loaded(window){
    return new Promise( (resolve, reject) => {
        window.onload = () => resolve()
        setTimeout(()=> reject(Error("window load timed out")), 500)
    });
}

async function newScript(document, {jscode, src, type} = {})
{
    const newScript = document.createElement("script");
    if(src) newScript.setAttribute("src", src)
    if(type) newScript.setAttribute("type", type)
    if(jscode) newScript.appendChild(document.createTextNode(jscode));
    const _loaded = loaded(newScript)
    document.body.appendChild(newScript)
    await _loaded   // Wait for internal script to load and run
    await delay(0)  // Let external script load and run
}
