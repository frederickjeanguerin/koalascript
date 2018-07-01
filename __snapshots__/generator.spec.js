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
