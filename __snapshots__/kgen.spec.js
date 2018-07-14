exports['kgen Generate map file 1'] = `
console.log("Hello World!");console.log("From KoalaScript!");
`

exports['kgen Generate map file 2'] = {
  "version": 3,
  "sources": [
    "default"
  ],
  "names": [],
  "mappings": "AAEU,OAAO,CAAC,GAAG,CAAC,cAAc,CAFpC,CAGU,OAAO,CAAC,GAAG,CAAC,mBAAmB,CAHzC",
  "file": "default",
  "sourcesContent": [
    "\n        # A very simple K program\n        $ console.log(\"Hello World!\")\n        $ console.log(\"From KoalaScript!\")\n    "
  ]
}

exports['kgen Detect and report inline JS errors 1'] = `
default (1:7): Unexpected token )
`

exports['kgen Detect and report inline JS errors 2'] = `
default (3:15): Unexpected token )
`
