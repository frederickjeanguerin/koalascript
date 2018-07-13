exports['kgen Generate map file 1'] = `
console.log("Hello World!");console.log("From KoalaScript!");
`

exports['kgen Generate map file 2'] = {
  "version": 3,
  "sources": [
    "default"
  ],
  "names": [],
  "mappings": "AAGW,OAAO,CAAC,GAAG,CAAC,cAAc,CAHrC,CAIW,OAAO,CAAC,GAAG,CAAC,mBAAmB,CAJ1C",
  "file": "default",
  "sourcesContent": [
    "\n        # A very simple K program\n        $ console.log(\"Hello World!\")\n        $ console.log(\"From KoalaScript!\")\n    "
  ]
}

exports['kgen Detect and report inline JS errors 1'] = `
undefined (1:5): Unexpected token )
`

exports['kgen Detect and report inline JS errors 2'] = `
undefined (1:5): Unexpected token )
`
