exports['kgen Detect and report inline JS errors 1'] = `
Error: kgen (1:7): Unexpected token )
`

exports['kgen Detect and report inline JS errors 2'] = `
Error: kgen (3:15): Unexpected token )
`

exports['kgen Generate map file 1'] = `
console.log("Hello World!");console.log("From KoalaScript!");
`

exports['kgen Generate map file 2'] = {
  "version": 3,
  "sources": [
    "kgen"
  ],
  "names": [],
  "mappings": "AAEU,OAAO,CAAC,GAAG,CAAC,cAAc,CAFpC,CAGU,OAAO,CAAC,GAAG,CAAC,mBAAmB,CAHzC",
  "file": "kgen",
  "sourcesContent": [
    "\n        # A very simple K program\n        $ console.log(\"Hello World!\")\n        $ console.log(\"From KoalaScript!\")\n    "
  ]
}
