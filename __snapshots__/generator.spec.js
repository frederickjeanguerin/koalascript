exports['generator Generate map file 1'] = `
console.log('Hello World!');
console.log('From KoalaScript!');
`

exports['generator Generate map file 2'] = {
  "version": 3,
  "sources": [
    "default"
  ],
  "names": [
    "console",
    "log"
  ],
  "mappings": "AAEUA,OAAA,CAAQC,GAAR,CAAY,cAAZ,E;AACAD,OAAA,CAAQC,GAAR,CAAY,mBAAZ",
  "sourcesContent": [
    "\n        # A very simple K program\n        $ console.log(\"Hello World!\")\n        $ console.log(\"From KoalaScript!\")\n    "
  ]
}

exports['generator Detect and report inline JS errors 1'] = `
Unexpected token (1:6) 
> 1 | $ 1 + ) +
    |       ^
`

exports['generator Detect and report inline JS errors 2'] = `
Unexpected token (3:18) 
  1 | 
  2 |             # A multiline program with a js syntax error
> 3 |             $ 1 + ) +
    |                   ^
  4 |             # somme comment after
  5 |         
`
