module.exports = {
    kcode : {
        helloFrom: kHelloFrom,
        helloWorld : kHelloFrom(),
    },
    jscode : {
        helloFrom : jsHelloFrom,
        helloWorld : jsHelloFrom(),
    }
};

function kHelloFrom (who = "KoalaScript") {
    return `
        # A very simple K program
        $ console.log("Hello World!")
        $ console.log("From ${who}!")
    `;
}

function jsHelloFrom (who = "KoalaScript") {
    return `
        // A very simple JS program
        console.log("Hello World!");
        console.log("From ${who}!");
    `;
}

