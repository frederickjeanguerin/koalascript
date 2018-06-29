@{%
    const klex = require("./klex");
%}

# Pass your lexer object using the @lexer option:
@lexer klex

# Grammar:
source -> stmt:* {% id %}
stmt -> %js_line {% id %}
