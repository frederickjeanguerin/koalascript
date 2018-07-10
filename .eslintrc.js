module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "node": true,
        "mocha": true,
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module",
        "ecmaVersion": 2018
    },
    "rules": {
        "indent": [
            "error",
            4,
            { "SwitchCase": 1 }
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        // "quotes": [
        //     "error",
        //     "double"
        // ],
        // "semi": [
        //     "error",
        //     "always"
        // ],
        'no-console': 'off',
        'no-extra-semi': 'off',
        'no-unused-vars': [
            "error",
            { "varsIgnorePattern": "__" }
        ],
    }
};
